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
  todos.forEach((todo) => {
    // Create task is done checkbox
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    if (todo.status === 'done') {
      checkbox.setAttribute('checked', true)
    }
    checkbox.onchange = () => {
      if (checkbox.checked) {
        todo.status = 'done'
        span.classList.add('task-done')
      } else {
        todo.status = 'todo'
        span.classList.remove('task-done')
      }
      console.table(todoArray)
      saveTodos(todos, TODO_CACHE)
    }
    // Create text
    const span = document.createElement('span')
    span.innerText = todo.task
    if (todo.status === 'done') {
      span.classList.add('task-done')
    }
    // Create button to update
    const editButton = document.createElement('button')
    editButton.classList.add('btn')
    editButton.innerText = 'E'
    editButton.onclick = () => {
      const isEditable = span.contentEditable === 'true'
      if (isEditable) {
        // Save and exit edit mode
        todo.task = span.innerText.trim()
        console.table(todos)
        saveTodos(todos, TODO_CACHE)
        editButton.innerText = 'E'
        span.removeAttribute('contenteditable')
        li.classList.remove('editing')
      } else {
        // Enter edit mode
        editButton.innerText = 'S'
        span.setAttribute('contenteditable', true)
        span.focus()
        li.classList.add('editing')
      }
    }
    // Create button to delete
    const deleteButton = document.createElement('button')
    deleteButton.classList.add('btn')
    deleteButton.innerText = 'X'
    // Add delete function to button
    deleteButton.onclick = () => {
      // Update the todoArray to one without this item
      todos = todos.filter((t) => t.id !== todo.id)
      renderTodoList(todos, todoList)
      saveTodos(todos, TODO_CACHE)
    }
    // Create btn-group
    const btnGroup = document.createElement('div')
    btnGroup.classList.add('btn-group')
    btnGroup.append(editButton, deleteButton)
    // Create list item
    const li = document.createElement('li')
    li.append(checkbox, span, btnGroup)
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
    let id
    do {
      id = Math.floor(Math.random() * 1000000)
    } while (todoArray.find((todo) => todo.id === id) !== undefined)
    return {
      id,
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
