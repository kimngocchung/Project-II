document.addEventListener("DOMContentLoaded", function() {
    fetch('menu.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('menu-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading menu:', error));

    fetchStudents();

    // Get the modal
    var modal = document.getElementById("studentModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

function fetchStudents() {
    fetch('/students')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(students => {
            console.log('Fetched students:', students);
            const studentTableBody = document.querySelector('#studentTable tbody');
            studentTableBody.innerHTML = '';
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.id}</td>
                    <td>${student.fullname}</td>
                    <td>${student.studentcode}</td>
                    <td>${student.class}</td>
                    <td><button class="detail-button" onclick="viewDetails(${student.id})">Chi tiết</button></td>
                `;
                studentTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching students:', error));
}

function viewDetails(id) {
    fetch(`/student-details?id=${id}`)
        .then(response => response.json())
        .then(student => {
            const studentDetails = document.getElementById('studentDetails');

            // Format the date of birth
            const dateOfBirth = new Date(student.dateofbirth);
            const formattedDate = dateOfBirth.toLocaleDateString();

            studentDetails.innerHTML = `
                <p>ID: ${student.id}</p>
                <p>Họ tên: ${student.fullname}</p>
                <p>Email: ${student.email}</p>
                <p>MSSV: ${student.studentcode}</p>
                <p>Ngày sinh: ${formattedDate}</p>
                <p>Số điện thoại: ${student.phonenumber}</p>
                <p>Lớp: ${student.class}</p>
                <p>Mật khẩu: ${student.password}</p>
            `;
            var modal = document.getElementById("studentModal");
            modal.style.display = "block";
        })
        .catch(error => console.error('Error fetching student details:', error));
}
