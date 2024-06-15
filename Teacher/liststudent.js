document.addEventListener("DOMContentLoaded", function() {
    fetch('menu.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('menu-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading menu:', error));

    fetchStudentsList(); // Fetch dữ liệu từ bảng students

    // Get the modal
    var modal = document.getElementById("studentModal");
    var deleteModal = document.getElementById("deleteModal");

    // Get the <span> element that closes the modal
    var closeModalButtons = document.getElementsByClassName("close");

    // When the user clicks on <span> (x), close the modal
    for (var i = 0; i < closeModalButtons.length; i++) {
        closeModalButtons[i].onclick = function() {
            modal.style.display = "none";
            deleteModal.style.display = "none";
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == deleteModal) {
            deleteModal.style.display = "none";
        }
    }

    // Handle import Excel
    document.getElementById('importExcel').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/import-students', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Import thành công');
                    fetchStudentsList(); // Fetch lại danh sách sinh viên sau khi import
                } else {
                    alert('Import thất bại');
                }
            })
            .catch(error => {
                console.error('Error importing students:', error);
                alert('Import thất bại');
            });
        }
    });
});

function fetchStudentsList() {
    fetch('/students-list')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(students => {
            console.log('Fetched students:', students); // Log dữ liệu sinh viên
            displayStudents(students);
        })
        .catch(error => console.error('Error fetching students:', error));
}

function displayStudents(students) {
    console.log('Displaying students:', students); // Log dữ liệu sinh viên được hiển thị
    const studentTableBody = document.querySelector('#studentTable tbody');
    studentTableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id || ''}</td>
            <td>${student.fullname || 'null'}</td>
            <td>${student.studentcode || 'null'}</td>
            <td>${student.class || 'null'}</td>
            
        `;
        studentTableBody.appendChild(row);
    });
}
/*
// Hiển thị modal xóa sinh viên
function showDeleteOptions() {
    document.getElementById("deleteModal").style.display = "block";
}

// Đóng modal xóa sinh viên
function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

// Xóa sinh viên theo MSSV
function deleteStudentByCode() {
    const studentCode = document.getElementById("deleteStudentCode").value;
    if (!studentCode) {
        alert("Vui lòng nhập MSSV cần xóa");
        return;
    }

    fetch(`http://127.0.0.1:5000/delete-student?studentcode=${studentCode}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Xóa sinh viên thành công');
            fetchStudentsList(); // Cập nhật lại danh sách sinh viên sau khi xóa
        } else {
            alert('Xóa sinh viên thất bại');
        }
        closeDeleteModal();
    })
    .catch(error => {
        console.error('Error deleting student:', error);
        alert('Xóa sinh viên thất bại');
        closeDeleteModal();
    });
}

// Xóa tất cả sinh viên
function deleteAllStudents() {
    if (!confirm("Bạn có chắc chắn muốn xóa tất cả sinh viên?")) {
        return;
    }

    fetch('http://127.0.0.1:5000/delete-all-students', {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Xóa tất cả sinh viên thành công');
            fetchStudentsList(); // Cập nhật lại danh sách sinh viên sau khi xóa
        } else {
            alert('Xóa tất cả sinh viên thất bại');
        }
        closeDeleteModal();
    })
    .catch(error => {
        console.error('Error deleting all students:', error);
        alert('Xóa tất cả sinh viên thất bại');
        closeDeleteModal();
    });
}*/
