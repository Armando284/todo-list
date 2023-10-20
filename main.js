'use strict'

function $ (tag) {
  if (!tag || typeof tag !== 'string' || tag === '') {
    throw new Error(`Invalid HTML tag: ${tag}`)
  }

  const elements = document.querySelectorAll(tag)
  if (!elements || elements.length === 0) {
    throw new Error(`Empty HTML tag: ${tag}`)
  }

  return elements.length === 1 ? elements[0] : elements
}

const todoForm = $('#todo-form')
const todoTask = $('#todo-task')
const todoTaskError = $('#todo-task-error')
const todoList = $('#todo-list')
const btnClearTasks = $('#btn-clear-tasks')
const btnClearInput = $('#btn-clear-input')

const TODO_CACHE = 'todo-local-cache'

let todoArray = []

function renderTodoList (todos, parentElem) {
  if (todos.length === 0) {
    parentElem.innerHTML = '<span>No tasks to be done!</span>'
    return
  }
  parentElem.innerHTML = ''
  todos.forEach((todo, index) => {
    // Create task is done checkbox
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.classList.add('mr-2')
    if (todo.status === 'done') {
      checkbox.setAttribute('checked', true)
    }
    checkbox.onchange = () => {
      if (checkbox.checked) {
        todo.status = 'done'
        label.classList.add('line-through', 'text-gray-400', 'italic')
      } else {
        todo.status = 'todo'
        label.classList.remove('line-through', 'text-gray-400', 'italic')
      }
      console.table(todoArray)
      saveTodos(todos, TODO_CACHE)
    }
    // Create text
    const label = document.createElement('label')
    label.classList.add('flex', 'align-middle', 'items-center')
    label.append(checkbox, todo.task)
    if (todo.status === 'done') {
      label.classList.add('line-through', 'text-gray-400', 'italic')
    }
    const buttonStyle = 'flex justify-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600'.split(' ')
    // Create button to update
    const editButton = document.createElement('button')
    editButton.classList.add(...buttonStyle, 'mr-2')
    editButton.innerText = '✏️'
    editButton.onclick = () => {
      const isEditable = label.contentEditable === 'true'
      if (isEditable) {
        // Save and exit edit mode
        todo.task = label.innerText.trim()
        console.table(todos)
        saveTodos(todos, TODO_CACHE)
        editButton.innerText = '✏️'
        label.removeAttribute('contenteditable')
        li.classList.remove('editing')
      } else {
        // Enter edit mode
        editButton.innerText = '🔒'
        label.setAttribute('contenteditable', true)
        label.focus()
        li.classList.add('editing')
      }
    }
    // Create button to delete
    const deleteButton = document.createElement('button')
    deleteButton.classList.add(...buttonStyle)
    deleteButton.innerText = '👎'
    // Add delete function to button
    deleteButton.onclick = () => {
      // Update the todoArray to one without this item
      todos = todos.filter((t) => t.id !== todo.id)
      renderTodoList(todos, todoList)
      saveTodos(todos, TODO_CACHE)
    }
    // Create btn-group
    const btnGroup = document.createElement('div')
    btnGroup.classList.add('flex')
    btnGroup.append(editButton, deleteButton)
    // Create list item
    const li = document.createElement('li')
    li.classList.add('flex', 'justify-between', 'align-middle', 'px-2', 'py-1', 'rounded-lg', 'hover:bg-indigo-100', 'hover:shadow-sm', 'cursor-grab')
    if (index % 2 === 0) {
      li.classList.add('bg-gray-100')
    }
    li.append(label, btnGroup)
    li.setAttribute('draggable', true)

    // manage drag & drop
    const dragInfoType = 'text/todo'
    // drag start
    li.ondragstart = (e) => {
      const dt = e.dataTransfer
      dt.setData(dragInfoType, index)
      dt.effectAllowed = 'move'
    }
    // drag enter
    li.ondragenter = (e) => {
      const items = e.dataTransfer.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'string' && item.type === dragInfoType) {
          e.preventDefault()
          return
        }
      }
    }
    // drag over
    li.ondragover = (e) => {
      e.dataTransfer.dropEffect = 'move'
      e.preventDefault()
    }
    // drop
    li.ondrop = (e) => {
      const idx = e.dataTransfer.getData(dragInfoType)
      const temp = todos.splice(idx, 1)[0]
      todos = [...todos.slice(0, index), temp, ...todos.slice(index)]
      todoArray = todos
      renderTodoList(todos, todoList)
      saveTodos(todos, TODO_CACHE)
    }
    // Add list item to parent
    parentElem.appendChild(li)
  })
}

todoForm.onsubmit = (e) => {
  e.preventDefault()

  const task = todoTask.value.trim()
  if (!task || task === '') {
    todoTaskError.innerText = 'Invalid new task!'
    todoTask.classList.add('has-error')
    return
  }

  const newTask = () => {
    return {
      id: crypto.randomUUID(),
      task,
      status: 'todo'
    }
  }

  todoTask.classList.remove('has-error')

  todoArray.push(newTask())
  console.table(todoArray)
  renderTodoList(todoArray, todoList)
  saveTodos(todoArray, TODO_CACHE)
  todoForm.reset()
  todoTaskError.innerText = ''
}

function saveTodos (todos, key) {
  localStorage.setItem(key, JSON.stringify(todos))
}

function readTodos (key) {
  return JSON.parse(localStorage.getItem(key)) ?? []
}

btnClearTasks.onclick = (e) => {
  e.stopPropagation()
  todoArray = []
  localStorage.removeItem(TODO_CACHE)
  renderTodoList(todoArray, todoList)
}

btnClearInput.onclick = (e) => {
  e.stopPropagation()
  e.preventDefault()
  todoForm.reset()
}

(function () {
  todoArray = readTodos(TODO_CACHE)
  renderTodoList(todoArray, todoList)
  console.table(todoArray)
})()
