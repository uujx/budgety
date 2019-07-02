
// Budget Conroller
var budgetController = (function() {

    var Expense = function(id, des, val) {
        this.id = id;
        this.description = des;
        this.value = val;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    };

    Expense.prototype.getPecentage = function() {
        return this.percentage;
    };

    var Income = function(id, des, val) {
        this.id = id;
        this.description = des;
        this.value = val;
    };

    var data = {
        allItems: {
            // Exact names as the class name in the html
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(element => {
            sum += element.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, id;

            // Create new id for the item
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Create object based on type, which is either 'exp' or 'inc'
            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type == 'inc') {
                newItem = new Income(id, des, val);
            }

            // Add the new item into the data structure
            data.allItems[type].push(newItem);

            // return the new item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // [1, 2, 4, 6, 7]
            ids = data.allItems[type].map(cur => {
                return cur.id
            });

            // Get the index of the item to be deleted
            index = ids.indexOf(parseInt(id));

            // Delete Item
            data.allItems[type].splice(index, 1);
        },

        calculateBudget: function() {            
            // Calculate income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage that we have spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                income: data.totals.inc,
                expenses: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            };
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(cur => {
                return cur.getPecentage();
            });
            return allPercentages;
        },

        testing: function() {
            console.log(data);
        }
    };
})();


// UI Controller
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expensesValue: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        containerLable: '.container',
        expensesPercentage: '.item__percentage',
        dateLable: '.budget__title--month'
    };

    var formatNumber = function(number, type) {
        var splitNum, int, dec;

        number = Math.abs(number);
        number = number.toFixed(2);

        splitNum = number.split('.');
        int = splitNum[0];
        dec = splitNum[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return  (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };

    // Create a forEach method for NodeList, cause it doesn't have one
    var nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        // Expose the DOM strings to other controllers
        getDOMStrings: function() {
            return DOMstrings;
        },

        // Clear the input field
        clearField: function() {
            document.querySelector(DOMstrings.inputDescription).value = "";
            document.querySelector(DOMstrings.inputValue).value = "";
    
            document.querySelector(DOMstrings.inputDescription).focus();
        },

        // Update the UI
        updateUI: function(item, type) {
            var html, newHtml, element;

            // Create HTML
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace placeholder with actual data
            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

            // Insert the HTMl into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteItem: function(id) {
            var element = document.getElementById(id)
            element.parentNode.removeChild(element);
        },

        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(DOMstrings.expensesValue).textContent = formatNumber(obj.expenses, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            allExpElement = document.querySelectorAll(DOMstrings.expensesPercentage);

            nodeListForEach(allExpElement, (cur, index) => {
                cur.textContent = percentages[index] + '%';
            });
        },

        dispalyDate: function() {
            var now, year, month;
            var mapping = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                            'August', 'September', 'October', 'November', 'December'];

            now = new Date();
            year = now.getFullYear();
            month = mapping[now.getMonth()];
            
            // console.dir(now);
            
            document.querySelector(DOMstrings.dateLable).textContent = month + ', ' + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
    };

})();


// Global App Controller
var Controller = (function(budgetCtrl, UICtrl) {

    var domStrings = UICtrl.getDOMStrings();

    var setupEventListener = function() {
        // Click event listener
        document.querySelector(domStrings.inputBtn).addEventListener('click', ctrlAddItem);
        
        // Enter key press event listener
        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || e.which === 13) {  // 13 is the key code of 'Enter'
                ctrlAddItem();
            }
        });

        // Delete event listener
        document.querySelector(domStrings.containerLable).addEventListener('click', ctrlDeleteItem);

        // UX inprovemt
        document.querySelector(domStrings.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();

            // 2. Get the budget
            var budget = budgetCtrl.getBudget();

            // 3. Display the budget on the UI
            UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate the Percentages
        budgetCtrl.calculatePercentages();

        // 2. Get the percentages
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {

        var input, newItem;
        // 1. Get user input
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {  // Check false input
            // 2. Add the item to the budget 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Clear the input field
            UICtrl.clearField();

            // 4. Add the item to the UI 
            UICtrl.updateUI(newItem, input.type);

            // 5. Update the budget
            updateBudget();

            // 6. Update the percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(e) {
        var itemId, splitId, type, id;

        itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = splitId[1];

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, id);

            // 2. Delete item from the UI
            UICtrl.deleteItem(itemId);

            // 3. Recalculate the budget
            updateBudget();

            // 4. Update the percentages
            updatePercentages();
        }

    };

    return {
        // Initialization function
        init: function() {
            setupEventListener();
            
            // Set all the number to 0 
            UICtrl.displayBudget({
                income: 0,
                expenses: 0,
                budget: 0,
                percentage: 0
            });

            UICtrl.dispalyDate();

            console.log('Application has started.');
        }
    };

})(budgetController, UIController);

Controller.init();