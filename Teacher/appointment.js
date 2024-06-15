function fetchPersonalAppointments(groupId) {
    fetch(`/Teacher/getPersonalAppointments?groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const appointmentTableBody = document.getElementById('personal-appointment-table-body');

            data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${appointment.fullname}</td>
                <td>${appointment.date_only}</td>
                <td>${appointment.start_time}</td>
                <td>${appointment.end_time}</td>
                <td>${appointment.location}</td>
                <td>${appointment.status}</td>
                <td><a class="detail-link">Chi tiết</a></td>
                `;
                appointmentTableBody.appendChild(row);

                row.querySelector('.detail-link').addEventListener('click', function () {
                    currentAppointmentId = appointment.id;
                    document.getElementById('personalAppointmentName').textContent = appointment.fullname;
                    document.getElementById('personalAppointmentDate').textContent = appointment.date_only;
                    document.getElementById('personalAppointmentStartTime').textContent = appointment.start_time;
                    document.getElementById('personalAppointmentEndTime').textContent = appointment.end_time;
                    document.getElementById('personalAppointmentLocation').value = appointment.location;
                    document.getElementById('personalAppointmentStatus').textContent = appointment.status;
                    document.getElementById('personalAppointmentDescription').value = appointment.description;

                    // Hiển thị modal
                    var myModal = new bootstrap.Modal(document.getElementById('personalAppointmentDetailModal'));
                    myModal.show();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function fetchGroupAppointments(groupId) {
    fetch(`/Teacher/getGroupAppointments?groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const appointmentTableBody = document.getElementById('group-appointment-table-body');

            data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${appointment.date_only}</td>
                <td>${appointment.start_time}</td>
                <td>${appointment.end_time}</td>
                <td>${appointment.location}</td>
                <td>${appointment.status}</td>
                <td><a class="detail-link">Chi tiết</a></td>
                `;
                appointmentTableBody.appendChild(row);

                row.querySelector('.detail-link').addEventListener('click', function () {
                    currentAppointmentId = appointment.id;
                    document.getElementById('groupAppointmentDate').textContent = appointment.date_only;
                    document.getElementById('groupAppointmentStartTime').textContent = appointment.start_time;
                    document.getElementById('groupAppointmentEndTime').textContent = appointment.end_time;
                    document.getElementById('groupAppointmentLocation').value = appointment.location;
                    document.getElementById('groupAppointmentStatus').textContent = appointment.status;
                    document.getElementById('groupAppointmentDescription').value = appointment.description;

                    // Hiển thị modal
                    var myModal = new bootstrap.Modal(document.getElementById('groupAppointmentDetailModal'));
                    myModal.show();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

let currentAppointmentId = null;

document.addEventListener('DOMContentLoaded', function () {
    const groupId = localStorage.getItem('selectedGroupId'); // Đọc groupId từ Local Storage
    if (groupId) {
        fetchPersonalAppointments(groupId);
        fetchGroupAppointments(groupId);
    } else {
        console.error('GroupId is missing');
    }
});

document.getElementById('personalSaveChangesButton').addEventListener('click', function () {
    const appointmentLocation = document.getElementById('personalAppointmentLocation').value;
    const appointmentDescription = document.getElementById('personalAppointmentDescription').value;

    fetch(`/updateAppointment`, {
        method: 'PATCH', // Update this line to use PATCH method
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: currentAppointmentId,
            location: appointmentLocation,
            description: appointmentDescription,
        }),
    })
        .then(response => response.json())
        .then(data => {
            clearPersonalAppointmentsTable();
            fetchPersonalAppointments(localStorage.getItem('selectedGroupId'));
            var myModal = bootstrap.Modal.getInstance(document.getElementById('personalAppointmentDetailModal'));
            myModal.hide();
        })
        .catch(error => {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        });
});

document.getElementById('groupSaveChangesButton').addEventListener('click', function () {
    const appointmentLocation = document.getElementById('groupAppointmentLocation').value;
    const appointmentDescription = document.getElementById('groupAppointmentDescription').value;

    fetch(`/updateAppointment`, {
        method: 'PATCH', // Update this line to use PATCH method
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: currentAppointmentId,
            location: appointmentLocation,
            description: appointmentDescription,
        }),
    })
        .then(response => response.json())
        .then(data => {
            clearGroupAppointmentsTable();
            fetchGroupAppointments(localStorage.getItem('selectedGroupId'));
            var myModal = bootstrap.Modal.getInstance(document.getElementById('groupAppointmentDetailModal'));
            myModal.hide();
        })
        .catch(error => {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        });
});

function clearPersonalAppointmentsTable() {
    const appointmentTableBody = document.getElementById('personal-appointment-table-body');
    while (appointmentTableBody.firstChild) {
        appointmentTableBody.removeChild(appointmentTableBody.firstChild);
    }
}

function clearGroupAppointmentsTable() {
    const appointmentTableBody = document.getElementById('group-appointment-table-body');
    while (appointmentTableBody.firstChild) {
        appointmentTableBody.removeChild(appointmentTableBody.firstChild);
    }
}