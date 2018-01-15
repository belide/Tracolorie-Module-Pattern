// Storage Controller
StorageController = (() => {
  return {
    storageItem(item) {
      let items;
      if (localStorage.getItem('items') === null) {
        items = [];
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
      } else {
        items = JSON.parse(localStorage.getItem('items'));
        // push
        items.push(item);
        // re set
        localStorage.setItem('items', JSON.stringify(items));
      }
    },
    getItemsFromStorage() {
      let items;
      localStorage.getItem('items') === null ? items = [] : items = JSON.parse(localStorage.getItem('items'));
      return items;
      },
      updateItemStorage(updatedItem) {
        let items = JSON.parse(localStorage.getItem('items'));
        items.find((item, index) => updatedItem.id === item.id ? items.splice(index, 1, updatedItem) : false);
        localStorage.setItem('items', JSON.stringify(items));
      },
      deleteItemFromLocalStorage(id) {
        let items = JSON.parse(localStorage.getItem('items'));
        items.find((item, index) => id === item.id ? items.splice(index, 1) : false);
        localStorage.setItem('items', JSON.stringify(items));
      },
      clearItemsFromStorage() {
        localStorage.removeItem('items');
      }
    };
})();
// Item Controller
const ItemController = (() => {
  // Item Constructor
  const Item = function(id, name, calories) {
    this.id = id;
    this.name = name;
    this.calories = calories;
  }
  // State
  const data = {
    items: StorageController.getItemsFromStorage(),
    currentItem: null,
    totalCalories: 0
  };
  // Public Methods
  return {
    getItems() {
      return data.items;
    },
    logData() {
      return data;
    },
    addItem(name, calories) {
      // Create ID
      let id;
      data.items.length > 0 ? id = data.items[data.items.length - 1].id + 1 : id = 0;
      // Parse calories to number
      calories = Number(calories);  
      // Create new item
      let newItem = new Item(id, name, calories);
      data.items.push(newItem);
      // return
      return newItem;  
    },
    getTotalCalories() {;
      document.querySelector('.total-calories').innerText = data.items.reduce((sum, current) => sum + current.calories, 0);
    },
    getItemById(id) {
      let found = null;
      data.items.find(item => item.id === id ? found = item : false);
      return found;
    },
    updateItem(name, calories) {
      calories = Number(calories);
      let found = null;
      data.items.find(item => {
        if (item.id === data.currentItem.id) {
          item.name = name;
          item.calories = calories;
          found = item;
        } 
      });
      return found;
    },
    setCurrentItem(item) {
      data.currentItem = item;
    },
    getCurrentItem() {
      return data.currentItem;
    },
    deleteItem() {
      let ids = data.items.map(item => item.id);
      // Get the index
      let index = ids.indexOf('id');
      // Delete from the data items arr
      data.items.splice(index, 1);
    },
    clearAllItems() {
      data.items = [];
    }
  }
})();


// UI Controller
const UIController = (() => {

  const config = {
    outputList: '#item-list',
    addBtn: '#add-meal',
    meal: '#item-name',
    calories: '#item-calories',
    updateBtn: '.update-btn',
    deleteBtn: '.delete-btn',
    backBtn: '.back-btn'
  };

  return {
    populateItems(items) {
      let html = '';
      items.map(item =>  {
        html += `
        <li class="collection-item" id="item-${item.id}">
          <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
          <a href="" class="secondary-content">
            <i class="edit-item fa fa-pencil"></i>
          </a>
        </li>`
      });
      // Insert it
      document.querySelector(config.outputList).innerHTML = html;
    },
    getSelectors() {
      return config;
    },
    addListItem(item) {
      document.querySelector(config.outputList).style.display = 'block';
      const li = document.createElement('li');
      li.setAttribute('class', 'collection-item');
      li.setAttribute('id', `item-${item.id}`);
      li.innerHTML = `
        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
        <a href="#" class="secondary-content">
          <i class="edit-item fa fa-pencil"></i>
        </a>
      `;
      document.querySelector(config.outputList).appendChild(li);
    },
    hideList() {
      document.querySelector(config.outputList).style.display = 'none';
    },
    clearEditState() {
      UIController.clearFields();
      document.querySelector(config.updateBtn).style.display = 'none';
      document.querySelector(config.deleteBtn).style.display = 'none';
      document.querySelector(config.backBtn).style.display = 'none';
      document.querySelector(config.addBtn).style.display = 'inline';
    },
    clearFields() {
      document.querySelector(config.meal).value = '';
      document.querySelector(config.calories).value = '';
    },
    setItemToForm() {
      document.querySelector(config.meal).value = ItemController.getCurrentItem().name;
      document.querySelector(config.calories).value = ItemController.getCurrentItem().calories;
      UIController.showEditState();
    },
    showEditState() {
      document.querySelector(config.updateBtn).style.display = 'inline';
      document.querySelector(config.deleteBtn).style.display = 'inline';
      document.querySelector(config.backBtn).style.display = 'inline';
      document.querySelector(config.addBtn).style.display = 'none';
    },
    getItemInput() {
      return {name: document.querySelector(config.meal).value, calories: document.querySelector(config.calories).value}
    },
    updateListItem(item) {
      let listItems = document.querySelectorAll('#item-list li');
      [...listItems].filter(listItem => {
        let itemId = listItem.getAttribute('id');
        itemId === `item-${item.id}` ? document.querySelector(`#${itemId}`).innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
        <a href="#" class="secondary-content">
          <i class="edit-item fa fa-pencil"></i>
        </a>` : false;
         // set again the total calories
        ItemController.getTotalCalories();
      });
    },
    deleteListItem(id) {
      const itemId = `#item-${id}`;
      document.querySelector(itemId).remove();
    },
    clearAllItems() {
      [...document.querySelectorAll(config.outputList)].map(item => item.remove());
    }
  };
})();


// App Controller
const AppController = ((ItemController, UIController, StorageController) => {

  // Events
  const eventListener = () => {
    const selectors = UIController.getSelectors();
    // edit state event
    document.querySelector(selectors.outputList).addEventListener('click', e => {
      // handler edit icon click
      if (e.target.classList.contains('edit-item')) {
        e.preventDefault();
        // get the list item ID
        const listId = e.target.parentElement.parentElement.getAttribute('id');
        // break into an array
        const listIdArr = listId.split('-');
        // get the actual id
        const id = Number(listIdArr[1]);
        // Get Item
        const itemToEdit = ItemController.getItemById(id);
        // Set current item
        ItemController.setCurrentItem(itemToEdit);
        // Add item to form
        UIController.setItemToForm();
      }
    });

    // Update item event
    document.querySelector(selectors.updateBtn).addEventListener('click', e => {
      e.preventDefault();
      // get item input
      const input = UIController.getItemInput();
      // update item
      const updatedItem = ItemController.updateItem(input.name, input.calories);
      // Update UI
      UIController.updateListItem(updatedItem);
      UIController.clearEditState();
      // Edit Local Storage
      StorageController.updateItemStorage(updatedItem);
    });
    // Back Button
    document.querySelector(selectors.backBtn).addEventListener('click', e => { 
      e.preventDefault();
      UIController.clearEditState();
    });
    // Delete Button
    document.querySelector(selectors.deleteBtn).addEventListener('click', e => {
      e.preventDefault();
      const currentItem = ItemController.getCurrentItem();
      ItemController.deleteItem(currentItem.id);
      // delete from ui
      UIController.deleteListItem(currentItem.id);
      // clear edit state
      UIController.clearEditState();
      // get calories
      ItemController.getTotalCalories();
      // delete from ls
      StorageController.deleteItemFromLocalStorage(currentItem.id);
    });
    // Click Add Btn Event Handler
    document.querySelector(selectors.addBtn).addEventListener('click', e => {
      e.preventDefault();
      let input = getInputs(selectors.meal, selectors.calories);  
      // Check for empty input values
      if (input.meal !== '' && input.calories != '') {
        let newItem = ItemController.addItem(input.meal, input.calories);
        // Add to UI
        UIController.addListItem(newItem);
        // get calories
        ItemController.getTotalCalories();
        // Clear Fields
        UIController.clearFields();
        // Storage
        StorageController.storageItem(newItem);
      }
    });

    // Clear all event
    document.querySelector('.clear-btn').addEventListener('click', e => {
      e.preventDefault();
      ItemController.clearAllItems();
      UIController.clearAllItems();
      // get calories
      ItemController.getTotalCalories();
      // Clear all from ls
      StorageController.clearItemsFromStorage()
    });

    // Disable enter (who add)
   document.addEventListener('keypress', e => e.keyCode === 13 || e.which === 13 ? e.preventDefault() : false);   
    // get inputs
    const getInputs = (mealInput, caloriesInput) => {
      let meal = document.querySelector(mealInput).value,
          calories = document.querySelector(caloriesInput).value;
      return {meal, calories}  
    };
  }

  // Public Methods
  return {
    init() {
      console.info('App Initialization!');
      // Clear edit state
      UIController.clearEditState();
      // Fetch Items for data structure
      const items = ItemController.getItems();
      // Check if exist any item
      items.length === 0 ? UIController.hideList() : UIController.populateItems(items);
       // get calories
      ItemController.getTotalCalories();
      // Events
      eventListener();
    }
  }
})(ItemController, UIController, StorageController);

// Init
AppController.init();



