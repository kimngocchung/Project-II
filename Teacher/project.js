function fetchProjects() {
    fetch('/Teacher/project/projects')
        .then(response => response.json())
        .then(data => {
            const projectTableBody = document.getElementById('project-table-body');
            let rowIndex = 1;
            data.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${rowIndex}</td>
                <td>${project.title}</td>
                <td><button class="detail-button" data-id="${project.id}" data-title="${project.title}" data-description="${project.description}">Chi tiết</button></td>
                <td><button class="delete-button" data-id="${project.id}">Xoá</button></td>
                `;
                projectTableBody.appendChild(row);
                rowIndex++;
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function clearProjectsTable() {
    const projectTableBody = document.getElementById('project-table-body');
    while (projectTableBody.firstChild) {
        projectTableBody.removeChild(projectTableBody.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchProjects();

    var projectAddLink = document.querySelector('.project-add-link');
    var addProjectModalElement = document.getElementById('addProjectModal');
    if (projectAddLink && addProjectModalElement) {
        projectAddLink.addEventListener('click', function (event) {
            event.preventDefault();
            var addProjectModal = new bootstrap.Modal(addProjectModalElement);
            addProjectModal.show();
        });
    } else {
        console.error('Element with class "project-add-link" or id "addProjectModal" not found');
    }

    var saveProjectButton = document.getElementById('saveProjectButton');
    if (saveProjectButton) {
        saveProjectButton.addEventListener('click', function () {
            const newProjectTitle = document.getElementById('newProjectTitle').value;
            const newProjectDescription = document.getElementById('newProjectDescription').value;

            // Create a new project object
            const newProject = {
                title: newProjectTitle,
                description: newProjectDescription
            };

            // Send a POST request to the server
            fetch('/Teacher/project/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProject),
            })
                .then(response => response.json())
                .then(data => {
                    clearProjectsTable();
                    fetchProjects();

                    var addProjectModal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
                    addProjectModal.hide();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });
    } else {
        console.error('Element with id "saveProjectButton" not found');
    }

    $(document).on('click', '.delete-button', function () {
        const projectId = $(this).data('id');
        var deleteModalElement = document.getElementById('deleteModal');
        if (deleteModalElement) {
            var deleteModal = new bootstrap.Modal(deleteModalElement);
            deleteModal.show();
        } else {
            console.error('Element with id "deleteModal" not found');
        }
        const confirmDeleteButton = document.getElementById('confirmDeleteButton');
        const newConfirmDeleteButton = confirmDeleteButton.cloneNode(true);
        confirmDeleteButton.parentNode.replaceChild(newConfirmDeleteButton, confirmDeleteButton);

        // If the user confirms the deletion, send an AJAX request
        newConfirmDeleteButton.addEventListener('click', function () {
            fetch(`/project/${projectId}`, {
                method: 'DELETE',
            })
                .then(response => response.text())
                .then(data => {
                    if (data === 'Không thể xoá đề tài đã gán với một nhóm.') {
                        alert(data);
                    } else {
                        clearProjectsTable();
                        fetchProjects();
                    }
                    deleteModal.hide();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });
    });

    $(document).on('click', '.detail-button', function () {
        const projectId = $(this).data('id');
        const projectTitle = $(this).data('title');
        const projectDescription = $(this).data('description');
    
        document.getElementById('projectTitle').innerText = projectTitle;
        document.getElementById('projectDescription').value = projectDescription;
    
        var myModal = new bootstrap.Modal(document.getElementById('projectModal'));
        myModal.show();
    
        const saveProjectDescriptionButton = document.getElementById('saveProjectDescriptionButton');
        const newSaveProjectDescriptionButton = saveProjectDescriptionButton.cloneNode(true);
        saveProjectDescriptionButton.parentNode.replaceChild(newSaveProjectDescriptionButton, saveProjectDescriptionButton);
    
        newSaveProjectDescriptionButton.addEventListener('click', function () {
            const projectDescription = document.getElementById('projectDescription').value;
    
            const updatedProject = {
                description: projectDescription
            };
    
            // Send a PUT request to the server
            fetch(`/project/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProject),
            })
                .then(response => response.json())
                .then(data => {
                    clearProjectsTable();
                    fetchProjects();
    
                    var projectModal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
                    projectModal.hide();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        });
    });
});