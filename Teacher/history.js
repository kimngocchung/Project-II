document.addEventListener('DOMContentLoaded', function () {
    function fetchPersonalAppointments() {
        fetch('/Teacher/history/personalappointment')
            .then(response => response.json())
            .then(data => {
                const appointmentTableBody = document.getElementById('appointmentTableBody');

                data.forEach(appointment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${appointment.fullname}</td>
                    <td>${appointment.name}</td>
                    <td>${appointment.date_only}</td>
                    <td>${appointment.start_time}</td>
                    <td>${appointment.end_time}</td>
                    <td>${appointment.location}</td>
                    <td>${appointment.status}</td>
                    <td><button onclick="showPersonalAppointmentDetails('${appointment.fullname}', '${appointment.name}', '${appointment.date_only}', '${appointment.start_time}', '${appointment.end_time}', '${appointment.location}', '${appointment.status}')">Chi tiết</button></td>
                `;
                    appointmentTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching appointment data:', error);
            });
    }
    function fetchGroupAppointments() {
        fetch('/Teacher/history/groupappointment')
            .then(response => response.json())
            .then(data => {
                const groupAppointmentTableBody = document.getElementById('groupAppointmentTableBody');

                data.forEach(appointment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${appointment.name}</td>
                        <td>${appointment.date_only}</td>
                        <td>${appointment.start_time}</td>
                        <td>${appointment.end_time}</td>
                        <td>${appointment.location}</td>
                        <td>${appointment.status}</td>
                        <td><button onclick="showGroupAppointmentDetails('${appointment.name}', '${appointment.date_only}', '${appointment.start_time}', '${appointment.end_time}', '${appointment.location}', '${appointment.status}')">Chi tiết</button></td>
                    `;
                    groupAppointmentTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching appointment data:', error);
            });
    }
    fetchGroupAppointments();
    fetchPersonalAppointments();
});
function showPersonalAppointmentDetails(fullname, groupName, date, startTime, endTime, location, status) {
    const modalTitle = document.getElementById('appointmentDetailsModalLabel');
    const modalBody = document.getElementById('appointmentDetailsBody');

    // Cập nhật nội dung cho modal
    modalTitle.textContent = 'Thông tin chi tiết cuộc hẹn';
    modalBody.innerHTML = `
        <p><strong>Tên thành viên:</strong> ${fullname}</p>
        <p><strong>Nhóm đề tài:</strong> ${groupName}</p>
        <p><strong>Ngày hẹn:</strong> ${date}</p>
        <p><strong>Thời gian bắt đầu:</strong> ${startTime}</p>
        <p><strong>Thời gian kết thúc:</strong> ${endTime}</p>
        <p><strong>Địa điểm:</strong> ${location}</p>
        <p><strong>Trạng thái:</strong> ${status}</p>
    `;

    // Hiển thị modal
    const appointmentDetailsModal = new bootstrap.Modal(document.getElementById('appointmentDetailsModal'), {
        keyboard: false
    });
    appointmentDetailsModal.show();
}
function showGroupAppointmentDetails(groupName, date, startTime, endTime, location, status) {
    const modalTitle = document.getElementById('appointmentDetailsModalLabel');
    const modalBody = document.getElementById('appointmentDetailsBody');

    // Cập nhật nội dung cho modal
    modalTitle.textContent = 'Thông tin chi tiết cuộc hẹn';
    modalBody.innerHTML = `
        <p><strong>Nhóm đề tài:</strong> ${groupName}</p>
        <p><strong>Ngày hẹn:</strong> ${date}</p>
        <p><strong>Thời gian bắt đầu:</strong> ${startTime}</p>
        <p><strong>Thời gian kết thúc:</strong> ${endTime}</p>
        <p><strong>Địa điểm:</strong> ${location}</p>
        <p><strong>Trạng thái:</strong> ${status}</p>
    `;

    // Hiển thị modal
    const appointmentDetailsModal = new bootstrap.Modal(document.getElementById('appointmentDetailsModal'), {
        keyboard: false
    });
    appointmentDetailsModal.show();
}

