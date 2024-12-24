const subjectColors = {
    'Economia': '#FF4081',        // Rosa acceso
    'Diritto': '#7C4DFF',        // Viola
    'Economia_Politica': '#00BCD4', // Azzurro
    'Matematica': '#FFC107',     // Giallo
    'Italiano': '#4CAF50',       // Verde
    'Inglese': '#FF5722',        // Arancione
    'Storia': '#9C27B0',         // Viola scuro
    'Francese': '#3F51B5',       // Blu
    'Tedesco': '#009688'         // Verde acqua
        };  

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentTaskId = null;

        function showAddTask() {
            document.getElementById('addTask').classList.add('show-add');
        }

        function hideAddTask() {
            document.getElementById('addTask').classList.remove('show-add');
            clearForm();
        }

        function clearForm() {
            document.getElementById('subject').value = 'Informatica';
            document.getElementById('description').value = '';
            document.getElementById('dueDate').value = '';
            currentTaskId = null;
        }

        function saveTask() {
            const subject = document.getElementById('subject').value;
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('dueDate').value;

            if (!subject || !description || !dueDate) {
                alert('Per favore, compila tutti i campi');
                return;
            }

            const task = {
                id: currentTaskId || Date.now(),
                subject,
                description,
                dueDate,
                color: subjectColors[subject]
            };

            if (currentTaskId) {
                const index = tasks.findIndex(t => t.id === currentTaskId);
                if (index !== -1) {
                    tasks[index] = task;
                }
            } else {
                tasks.push(task);
            }

            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            hideAddTask();
        }

        function renderTasks() {
            const tasksList = document.getElementById('tasksList');
            const noTasks = document.getElementById('noTasks');
            
            // Ordina i task per data di scadenza
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            if (tasks.length === 0) {
                tasksList.innerHTML = '';
                noTasks.style.display = 'block';
                return;
            }

            noTasks.style.display = 'none';
            tasksList.innerHTML = tasks.map(task => `
                <div class="task-card" data-id="${task.id}">
                    <div class="task-header">
                        <span class="subject-tag" style="background: ${task.color}20; color: ${task.color}">
                            ${task.subject}
                        </span>
                        <span class="task-date">
                            ${new Date(task.dueDate).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div class="task-description">${task.description}</div>
                    <div class="delete-overlay">Modifica</div>
                    <div class="edit-overlay">Elimina</div>
                </div>
            `).join('');

            // Aggiungi gesture handling per ogni card
            document.querySelectorAll('.task-card').forEach(card => {
                const hammer = new Hammer(card);
                let isDragging = false;
                let startX = 0;

                hammer.on('panstart', () => {
                    isDragging = true;
                    startX = card.style.transform ? 
                        parseInt(card.style.transform.replace('translateX(', '')) :
                        0;
                });

                hammer.on('panleft panright', (e) => {
                    if (!isDragging) return;
                    const newX = startX + e.deltaX;
                    
                    if (newX < -80) {
                        card.style.transform = 'translateX(-80px)';
                        card.querySelector('.edit-overlay').style.transform = 'translateX(0)';
                    } else if (newX > 80) {
                        card.style.transform = 'translateX(80px)';
                        card.querySelector('.delete-overlay').style.transform = 'translateX(0)';
                    } else {
                        card.style.transform = `translateX(${newX}px)`;
                        card.querySelector('.edit-overlay').style.transform = 'translateX(-100%)';
                        card.querySelector('.delete-overlay').style.transform = 'translateX(100%)';
                    }
                });

                hammer.on('panend', (e) => {
                    isDragging = false;
                    const threshold = 40;

                    if (e.deltaX < -threshold) {
                        // Edit
                        editTask(card.dataset.id);
                    } else if (e.deltaX > threshold) {
                        // Delete
                        showDeleteModal(card.dataset.id);
                    }

                    // Reset position
                    card.style.transform = 'translateX(0)';
                    card.querySelector('.edit-overlay').style.transform = 'translateX(-100%)';
                    card.querySelector('.delete-overlay').style.transform = 'translateX(100%)';
                });
            });
        }

        function editTask(taskId) {
            const task = tasks.find(t => t.id === parseInt(taskId));
            if (!task) return;

            currentTaskId = task.id;
            document.getElementById('subject').value = task.subject;
            document.getElementById('description').value = task.description;
            document.getElementById('dueDate').value = task.dueDate;
            showAddTask();
        }

        function showDeleteModal(taskId) {
            currentTaskId = parseInt(taskId);
            document.getElementById('deleteModal').style.display = 'block';
            document.getElementById('modalBackdrop').style.display = 'block';
        }

        function hideDeleteModal() {
            document.getElementById('deleteModal').style.display = 'none';
            document.getElementById('modalBackdrop').style.display = 'none';
            currentTaskId = null;
        }

        function deleteTask() {
            tasks = tasks.filter(t => t.id !== currentTaskId);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            hideDeleteModal();
        }

        // Event Listeners
        document.getElementById('addBtn').addEventListener('click', showAddTask);
        document.getElementById('backBtn').addEventListener('click', hideAddTask);
        document.getElementById('saveBtn').addEventListener('click', saveTask);
        document.getElementById('confirmDelete').addEventListener('click', deleteTask);
document.getElementById('cancelDelete').addEventListener('click', hideDeleteModal);
document.getElementById('modalBackdrop').addEventListener('click', hideDeleteModal);

// Inizializza l'app caricando i task esistenti
renderTasks();
   