function fetchGroups() {
    fetch('/Student/getGroups')
        .then(response => response.json())
        .then(data => {
            const groupTableBody = document.getElementById('group-table-body');

            data.forEach(group => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${group.name}</td>
                <td>${group.title}</td>
                <td>${group.fullname}</td>
                <td><a class="detail-link">Chi tiết</a></td>
                <td>Chi tiết</td>
                `;
                groupTableBody.appendChild(row);

                // Thêm sự kiện click cho liên kết "Chi tiết"
                row.querySelector('.detail-link').addEventListener('click', function () {
                    document.getElementById('groupName').textContent = group.name;
                    document.getElementById('projectTitle').textContent = group.title;
                    document.getElementById('teacherName').textContent = group.fullname;
                    document.getElementById('projectDescription').textContent = group.description;

                    fetchStudentsOfGroup(group.id);

                    // Hiển thị modal
                    var myModal = new bootstrap.Modal(document.getElementById('groupModal'));
                    myModal.show();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function fetchStudentsOfGroup(groupId) {
    fetch(`/getStudentsOfGroup?group_id=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const groupMembersTableBody = document.getElementById('groupMembers');
            groupMembersTableBody.innerHTML = ''; // Clear the table body
            data.forEach(member => {
                const memberRow = document.createElement('tr');
                memberRow.innerHTML = `
                <td>${member.fullname}</td>
                <td>${member.studentcode}</td>
                `;
                groupMembersTableBody.appendChild(memberRow);
            });
        })
        .catch(error => {
            console.error('Error fetching students of group:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchGroups();
});