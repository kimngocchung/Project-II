function fetchGroups() {
    fetch('/Teacher/group/groups')
        .then(response => response.json())
        .then(data => {
            const groupTableBody = document.getElementById('group-table-body');

            data.forEach(group => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${group.name}</td>
                <td>${group.title}</td>
                <td><a class="detail-link">Chi tiết</a></td>
                <td><a class="appointment-link data-group-id="${group.id}">Chi tiết</a></td>
                <td><a class="edit-detail">Sửa</a></td>
                `;
                groupTableBody.appendChild(row);

                // Thêm sự kiện click cho liên kết "Chi tiết"
                row.querySelector('.detail-link').addEventListener('click', function () {
                    document.getElementById('groupName').textContent = group.name;
                    document.getElementById('projectTitle').textContent = group.title;
                    document.getElementById('projectDescription').textContent = group.description;

                    // Hiển thị modal
                    var myModal = new bootstrap.Modal(document.getElementById('groupModal'));
                    myModal.show();
                });

                row.querySelector('.edit-detail').addEventListener('click', function () {
                    document.getElementById('groupNameEdit').value = group.name;
                    const projectDropdownEdit = document.getElementById('projectDropdownEdit');
                    projectDropdownEdit.innerHTML = '';

                    // Populate the dropdown with the stored projects
                    projects.forEach(project => {
                        const option = document.createElement('option');
                        option.value = project.id;
                        option.text = project.title;
                        if (project.id === group.project_id) {
                            option.selected = true;
                        }
                        projectDropdownEdit.add(option);
                    });
                    fetchStudentsOfGroup(group.id);
                    // Show the edit modal
                    var editModal = document.getElementById('editGroupModal');
                    editModal.dataset.groupId = group.id;

                    var bootstrapModal = new bootstrap.Modal(editModal);
                    bootstrapModal.show();
                });

                row.querySelector('.appointment-link').addEventListener('click', function () {
                    localStorage.setItem('selectedGroupId', group.id);
                    localStorage.setItem('selectedGroupTeacherId', group.teacher_id);
                    window.location.href = `/Teacher/appointment?groupId=${group.id}`;
                });
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function fetchProjects() {
    fetch('/Teacher/project/projects')
        .then(response => response.json())
        .then(data => {
            projects = data;
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function fetchStudents() {
    fetch('/Teacher/getStudents')
        .then(response => response.json())
        .then(data => {
            students = data;
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function fetchStudentsOfGroup(group_id) {
    fetch(`/getStudentsOfGroup?group_id=${group_id}`)
        .then(response => response.json())
        .then(data => {
            students = data;
            resetTemporaryParticipantsEdit();
            // Add each student to the temporary participants and display them in the table
            students.forEach(student => {
                addParticipantToGroupEdit(student);
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

document.getElementById('participantSearch').addEventListener('input', function () {
    const searchTerm = this.value;
    displaySearchResults(searchTerm);
});

document.getElementById('participantSearchEdit').addEventListener('input', function () {
    displaySearchResultsEdit(this.value);
});

function displaySearchResults(searchTerm) {
    const searchResults = document.getElementById('searchResults');

    if (!searchTerm.trim()) {
        searchResults.innerHTML = '';
        return;
    }
    fetchStudents();
    const filteredStudents = students.filter(student =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !temporaryParticipants.includes(student.fullname)
    );

    const limitedResults = filteredStudents.slice(0, 5);

    searchResults.innerHTML = '';
    limitedResults.forEach(student => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = student.fullname;
        listItem.addEventListener('click', () => {
            addParticipantToGroupAdd(student);
            searchResults.innerHTML = ''; // Clear the search results
        });
        searchResults.appendChild(listItem);
    });
}

function displaySearchResultsEdit(searchTerm) {
    const searchResultsEdit = document.getElementById('searchResultsEdit');

    if (!searchTerm.trim()) {
        searchResultsEdit.innerHTML = '';
        return;
    }
    fetchStudents();
    const filteredStudents = students.filter(student =>
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !temporaryParticipants.includes(student.fullname)
    );

    const limitedResults = filteredStudents.slice(0, 5);

    searchResultsEdit.innerHTML = '';
    limitedResults.forEach(student => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = student.fullname;
        listItem.addEventListener('click', () => {
            addParticipantToGroupEdit(student);
            searchResultsEdit.innerHTML = ''; // Clear the search results
        });
        searchResultsEdit.appendChild(listItem);
    });
}

function addParticipantToGroupAdd(student) {
    temporaryParticipants.push(student);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.fullname}</td>
        <td>${student.studentcode}</td>
        <td><button class="btn btn-danger remove-participant-button-add">Xóa</button></td>
    `;
    document.getElementById('temporaryParticipantsTableBodyAdd').appendChild(row);

    // Thêm sự kiện click cho nút "Xóa"
    row.querySelector('.remove-participant-button-add').addEventListener('click', function () {
        const index = temporaryParticipants.indexOf(student.fullname);
        if (index > -1) {
            temporaryParticipants.splice(index, 1);
        }
        row.remove();
    });

    // Xóa nội dung input tìm kiếm
    document.getElementById('participantSearch').value = '';
}

function resetTemporaryParticipantsAdd() {
    temporaryParticipants.length = 0;
    const temporaryParticipantsTableBodyAdd = document.getElementById('temporaryParticipantsTableBodyAdd');
    while (temporaryParticipantsTableBodyAdd.firstChild) {
        temporaryParticipantsTableBodyAdd.removeChild(temporaryParticipantsTableBodyAdd.firstChild);
    }
}

function addParticipantToGroupEdit(student) {
    temporaryParticipants.push(student);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.fullname}</td>
        <td>${student.studentcode}</td>
        <td><button class="btn btn-danger remove-participant-button-edit">Xóa</button></td>
    `;
    document.getElementById('temporaryParticipantsTableBodyEdit').appendChild(row);

    // Thêm sự kiện click cho nút "Xóa"
    row.querySelector('.remove-participant-button-edit').addEventListener('click', function () {
        const index = temporaryParticipants.findIndex(tempStudent => tempStudent.id === student.id);
        if (index > -1) {
            temporaryParticipants.splice(index, 1);
        }
        row.remove();
    });

    // Xóa nội dung input tìm kiếm
    document.getElementById('participantSearchEdit').value = '';
}

function resetTemporaryParticipantsEdit() {
    temporaryParticipants.length = 0;
    const temporaryParticipantsTableBodyEdit = document.getElementById('temporaryParticipantsTableBodyEdit');
    while (temporaryParticipantsTableBodyEdit.firstChild) {
        temporaryParticipantsTableBodyEdit.removeChild(temporaryParticipantsTableBodyEdit.firstChild);
    }
}

function clearGroupsTable() {
    const groupTableBody = document.getElementById('group-table-body');
    while (groupTableBody.firstChild) {
        groupTableBody.removeChild(groupTableBody.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchGroups();
    fetchProjects();
    fetchStudents();
});

document.querySelector('.group-add-link').addEventListener('click', function (event) {
    event.preventDefault();

    const projectDropdown = document.getElementById('projectDropdown');
    projectDropdown.innerHTML = '<option value="">-- Chọn đề tài --</option>';

    // Populate the dropdown with the stored projects
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.text = project.title;
        projectDropdown.add(option);
    });
    var myModal = new bootstrap.Modal(document.getElementById('addGroupModal'));
    myModal.show();

    addGroupModal.addEventListener('hidden.bs.modal', function () {
        // Reset the form
        document.getElementById('addGroupForm').reset();

        // Reset the temporary participants
        resetTemporaryParticipantsAdd();
    });
});

const temporaryParticipants = [];
let projects = [];

document.getElementById('saveGroupButton').addEventListener('click', function () {
    const groupName = document.getElementById('groupNameInput').value;
    const projectDropdown = document.getElementById('projectDropdown');
    const projectId = projectDropdown.options[projectDropdown.selectedIndex].value;

    if (projectDropdown.value === "") {
        alert("Vui lòng chọn một đề tài.");
        return;
    }

    // Lưu thông tin nhóm mới
    // Bạn cần thay thế phần này bằng mã để lưu thông tin nhóm mới vào cơ sở dữ liệu của bạn
    console.log('Lưu thông tin nhóm mới:', groupName, temporaryParticipants, projectId);
    const tempStudentIds = temporaryParticipants.map(student => student.id);
    const newGroup = {
        groupName: groupName,
        projectId: projectId,
        studentIds: tempStudentIds,
    };

    fetch('/Teacher/addGroup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Group saved successfully');
            } else {
                console.error('Error saving group:', data.error);
            }
            clearGroupsTable();
            fetchGroups();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    resetTemporaryParticipantsAdd();

    // Đóng modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('addGroupModal'));
    myModal.hide();
});

document.getElementById('saveGroupButtonEdit').addEventListener('click', function () {
    const groupName = document.getElementById('groupNameEdit').value;
    const projectDropdownEdit = document.getElementById('projectDropdownEdit');
    const projectId = projectDropdownEdit.options[projectDropdownEdit.selectedIndex].value;
    const groupId = document.getElementById('editGroupModal').dataset.groupId;

    // Lưu thông tin nhóm mới
    // Bạn cần thay thế phần này bằng mã để lưu thông tin nhóm mới vào cơ sở dữ liệu của bạn
    console.log('Cập nhật thông tin nhóm mới:', groupName, temporaryParticipants, projectId);
    const tempStudentIds = temporaryParticipants.map(student => student.id);
    const updatedGroup = {
        groupName: groupName,
        projectId: projectId,
        studentIds: tempStudentIds,
        groupId: groupId,
    };

    console.log('Before fetch edit, studentIds:', updatedGroup.studentIds);

    fetch('/Teacher/editGroup', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Group saved successfully');
            } else {
                console.error('Error saving group:', data.error);
            }
            console.log('After fetch edit, studentIds:', updatedGroup.studentIds);
            clearGroupsTable();
            fetchGroups();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    resetTemporaryParticipantsEdit();

    // Đóng modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('editGroupModal'));
    myModal.hide();
});