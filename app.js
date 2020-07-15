var budgetController = (function () {

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round( (this.value / totalIncome)*100 );
        }
        else{
            this.percentage = -1;
        }    
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var calculate = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum +=current.value;
            
        });
        

        data.totals[type] = sum;

    };
    var data = {
        allItems:{
            inc:[],
            exp:[],
        },
        totals:{
            inc:0,
            exp:0,
        },
        budget:0,
        percentage:-1,
    }

    return {
        addItem: function (type,des,val){
            var ID,newItem;

            if(data.allItems[type].length > 0){
                ID  = data.allItems[type][data.allItems[type].length - 1].id+1;
            }
            else{
                ID=0;
            }    
            if(type==="inc"){
                newItem = new Income(ID,des,val);
            }
            else if (type ==="exp"){
                newItem = new Expense(ID,des,val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem:function(type,id){
            var ids,index;
            
            ids =  data.allItems[type].map(function(current){  
                return current.id;
                });
            index = ids.indexOf(id);
                
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            else{
                console.log("Your ID is -1");
            }
        },
        calculateBudget:function(){
            
            // 1. calculate total income and expense
            calculate("inc");
            calculate("exp");

            // 2. calculate income (income-expense)
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. calculate persentage
            if(data.totals.inc > 0 )
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100); 
            else
                data.percentage = -1;    
        },
        returnBudget:function(){
            return{
                totalIncome:data.totals.inc,
                totalExpense:data.totals.exp,
                budget:data.budget,
                percentage:data.percentage,
            }
        },
        calculatePercentage:function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },
        returnPercentage:function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            })
            return allPerc;
        },
        test: function(){
            console.log(data);
        }
    }

})();


var UIController = (function (){

    var DOMstrings = {
        inputType:".add__type",
        inputDescription:".add__description",
        inputValue:".add__value",
        inputBtn:".add__btn",
        expenseList:".expenses__list",
        incomeList:".income__list",
        budgetLabel:".budget__value",
        incomeLabel:".budget__income--value",
        expensesLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        expensesPercLabel:".item__percentage",
        dateLabel:".budget__title--month",
    };
    var formatNumber = function(num,type){
        var numSplit,int,dec,type;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        
        int=numSplit[0];
        if(int.length>3){
            int = int.substr(0,int.length-3) +","+int.substr(int.length-3,3);
        }
        
        dec = numSplit[1];
        
        return (type==="exp" ? "-":"+")+" "+int+"."+dec;

    };
    var nodeListForEach = function(list,callback){
        for(let i = 0; i<list.length; i++){
            callback(list[i],i);
        }
        
    };
    return {
        getInput: function(){
            return {
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        addListItem:function(obj,type){
            var html, newHtml,element;
            if(type==="inc"){
                element = DOMstrings.incomeList;               
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type==="exp"){
                element = DOMstrings.expenseList;
                html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
        },
        displayBudget:function(obj){
            var type;
            obj.budget > 0 ? type="inc":type="exp"; 

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,type);
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpense,type);
            if(obj.percentage > 0){
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage; 
            }
            else{
               document.querySelector(DOMstrings.percentageLabel).textContent = "---";    
            }
            
        },
        clearFileds:function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current,index,array){
                current.value = "";
            })
            fieldsArray[0].focus();

        },
        removeItem:function(selectorID){
            var element = document.getElementById(selectorID)
            element.parentNode.removeChild(element);

        },
        displayPercentages:function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0 ){
                   
                    current.textContent = percentages[index] + "%";
                }
                else{
                    current.textContent = "---";
                }

            })
        },
        getDate:function(){
            var now,month,year,months;

            now = new Date();

            months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
            

            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
            


        },
        changedType:function(){
            var  fields;

            fields = document.querySelectorAll(DOMstrings.inputType + ", "+DOMstrings.inputDescription + ", "+DOMstrings.inputValue);

            nodeListForEach(fields,function(current){
                current.classList.toggle("red-focus")
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red")

        },
         getDOMstrings: function(){
            return DOMstrings;
        },
    }
})();

var controller = (function (budgetCtrl,UICtrl) {
    
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
       
        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode===13 || event.which===13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem)
        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType)
    }
    var updateBudget = function(){
        var budget;
        // 1. Calculate budget.
        budgetCtrl.calculateBudget();

        // 2. Return the budget.
        budget = budgetCtrl.returnBudget();

        // 3. Display the budget on the UI.
        UICtrl.displayBudget(budget);
    }
    var ctrlAddItem = function(){
        var input,newItem;
        // 1. Get tge field input data
        input = UICtrl.getInput();
        
        if(input.description !=="" && isNaN(input.value)===false && input.value>0){
            // 2. Add the item to the budget controller
            newItem= budgetCtrl.addItem(input.type,input.description,input.value); 

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem,input.type);

            // 4. Clear the fields
            UICtrl.clearFileds();

            // 5. Calculate and update the budget
            updateBudget();

            // 6.  Calculate and update the percentage
            addPercentages();

        }
    };
    var ctrlDeleteItem = function(event){
        var itemID,splitID,ID,type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseFloat(splitID[1]);

            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID)
            
            // 2. Delete the item from the UI
            UICtrl.removeItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update the percentage
            addPercentages();
        }
    };

    var addPercentages = function(){

        // 1. calculate percentage
        budgetCtrl.calculatePercentage();
        // 2. read percentage from the budget controller
        var perc = budgetCtrl.returnPercentage();
        // 3. display the percentage to the UI
        UICtrl.displayPercentages(perc);


    }
    return {
        init:function(){
            setUpEventListeners();
            UICtrl.getDate();
            UICtrl.displayBudget({
                totalIncome:0,
                totalExpense:0,
                budget:0,
                percentage:0,
            })
        }
    }
})(budgetController,UIController);

controller.init();























