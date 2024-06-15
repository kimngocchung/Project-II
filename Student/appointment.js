function getCurrentDateFormatted() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function fetchAppointments(groupId) {
    fetch(`/Student/getAppointments?groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            const appointmentTableBody = document.getElementById('appointment-table-body');

            data.forEach(appointment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${appointment.type}</td>
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
                    document.getElementById('appointmentType').textContent = appointment.type;
                    document.getElementById('appointmentDate').textContent = appointment.date_only;
                    document.getElementById('appointmentStartTime').textContent = appointment.start_time;
                    document.getElementById('appointmentEndTime').textContent = appointment.end_time;
                    document.getElementById('appointmentLocation').value = appointment.location;
                    document.getElementById('appointmentStatus').textContent = appointment.status;
                    document.getElementById('appointmentDescription').value = appointment.description;

                    if (appointment.status === 'Scheduled') {
                        document.getElementById('deleteAppointmentButton').style.display = '';
                    } else {
                        document.getElementById('deleteAppointmentButton').style.display = 'none';
                    }

                    // Hiển thị modal
                    var myModal = new bootstrap.Modal(document.getElementById('appointmentDetailModal'));
                    myModal.show();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
    populateTimeSelects();
}

let personalFreeTimes = [];
let groupFreeTimes = [];

function fetchPersonalFreeTimes(date, teacherId) {
    fetch(`/getPersonalFreeTimes?date=${date}&teacherId=${teacherId}`)
        .then(response => response.json())
        .then(data => {
            personalFreeTimes = data;

            const personalFreeTimesBody = document.getElementById('personal-free-times-body');
            let currentRow = null;
            let columnCounter = 0;
            const maxColumnsPerRow = 3; // Số lượng cột tối đa mỗi hàng

            // Xóa nội dung hiện tại
            while (personalFreeTimesBody.firstChild) {
                personalFreeTimesBody.removeChild(personalFreeTimesBody.firstChild);
            }

            personalFreeTimes.forEach(freeTime => {
                if (columnCounter === 0) {
                    currentRow = document.createElement('tr');
                }

                const cell = document.createElement('td');
                cell.textContent = `${freeTime.free_start} - ${freeTime.free_end}`;
                currentRow.appendChild(cell);

                columnCounter++;

                if (columnCounter === maxColumnsPerRow) {
                    personalFreeTimesBody.appendChild(currentRow);
                    columnCounter = 0; // Reset counter
                }
            });

            // Thêm hàng cuối cùng nếu cần
            if (columnCounter !== 0) {
                personalFreeTimesBody.appendChild(currentRow);
            }

            document.getElementById('personalFreeTimesAvailable').style.display = 'block'; // Hiển thị các mục
            console.log(personalFreeTimes.length);
            if (personalFreeTimes.length === 0) {
                document.getElementById('personalAppointmentDetails').style.display = 'none'; // Ẩn nếu không có free times
            } else {
                document.getElementById('personalAppointmentDetails').style.display = 'block'; // Hiển thị các mục
            }
        })
        .catch(error => console.error('Error fetching free times:', error));
}

function fetchGroupFreeTimes(date, teacherId, groupId) {
    fetch(`/getGroupFreeTimes?date=${date}&teacherId=${teacherId}&groupId=${groupId}`)
        .then(response => response.json())
        .then(data => {
            groupFreeTimes = data;

            const groupFreeTimesBody = document.getElementById('group-free-times-body');
            let currentRow = null;
            let columnCounter = 0;
            const maxColumnsPerRow = 3; // Số lượng cột tối đa mỗi hàng

            // Xóa nội dung hiện tại
            while (groupFreeTimesBody.firstChild) {
                groupFreeTimesBody.removeChild(groupFreeTimesBody.firstChild);
            }

            groupFreeTimes.forEach(freeTime => {
                if (columnCounter === 0) {
                    currentRow = document.createElement('tr');
                }

                const cell = document.createElement('td');
                cell.textContent = `${freeTime.free_start} - ${freeTime.free_end}`;
                currentRow.appendChild(cell);

                columnCounter++;

                if (columnCounter === maxColumnsPerRow) {
                    groupFreeTimesBody.appendChild(currentRow);
                    columnCounter = 0; // Reset counter
                }
            });

            // Thêm hàng cuối cùng nếu cần
            if (columnCounter !== 0) {
                groupFreeTimesBody.appendChild(currentRow);
            }

            document.getElementById('groupFreeTimesAvailable').style.display = 'block'; // Hiển thị các mục
            console.log(groupFreeTimes.length);
            if (groupFreeTimes.length === 0) {
                document.getElementById('groupAppointmentDetails').style.display = 'none'; // Ẩn nếu không có free times
            } else {
                document.getElementById('groupAppointmentDetails').style.display = 'block'; // Hiển thị các mục
            }
        })
        .catch(error => console.error('Error fetching free times:', error));
}

let currentAppointmentId = null;

document.addEventListener('DOMContentLoaded', function () {
    const currentDate = getCurrentDateFormatted();
    document.getElementById('personalDate').setAttribute('min', currentDate);
    document.getElementById('groupDate').setAttribute('min', currentDate);

    const groupId = localStorage.getItem('selectedGroupId'); // Đọc groupId từ Local Storage
    if (groupId) {
        fetchAppointments(groupId);
    } else {
        console.error('GroupId is missing');
    }

    const tabs = document.querySelectorAll('.nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.querySelector(tab.getAttribute('data-target'));

            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('show', 'active'));

            // Show the target tab pane
            target.classList.add('show', 'active');

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to the clicked tab
            tab.classList.add('active');
        });
    });
});

document.getElementById('saveChangesButton').addEventListener('click', function () {
    const appointmentLocation = document.getElementById('appointmentLocation').value;
    const appointmentDescription = document.getElementById('appointmentDescription').value;

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
            clearAppointmentsTable();
            fetchAppointments(localStorage.getItem('selectedGroupId'));
            var myModal = bootstrap.Modal.getInstance(document.getElementById('appointmentDetailModal'));
            myModal.hide();
        })
        .catch(error => {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        });
});

document.getElementById('deleteAppointmentButton').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete this appointment?')) {
        // Assuming there's an endpoint '/Student/deleteAppointment' and appointmentId is stored globally or retrieved in another way
        fetch(`/Student/deleteAppointment/${currentAppointmentId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                clearAppointmentsTable();
                fetchAppointments(localStorage.getItem('selectedGroupId'));
                var myModal = bootstrap.Modal.getInstance(document.getElementById('appointmentDetailModal'));
                myModal.hide();
            })
            .catch(error => {
                console.error('Error deleting appointment:', error);
                alert('Failed to delete appointment');
            });
    }
});

document.querySelector('.appointment-add-link').addEventListener('click', function (event) {
    event.preventDefault();
    var myModal = new bootstrap.Modal(document.getElementById('addAppointmentModal'));
    myModal.show();
});

function populateTimeSelects() {
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const personalStartHourSelect = document.getElementById('personalStartHour');
    const personalStartMinuteSelect = document.getElementById('personalStartMinute');
    const personalEndHourSelect = document.getElementById('personalEndHour');
    const personalEndMinuteSelect = document.getElementById('personalEndMinute');
    const groupStartHourSelect = document.getElementById('groupStartHour');
    const groupStartMinuteSelect = document.getElementById('groupStartMinute');
    const groupEndHourSelect = document.getElementById('groupEndHour');
    const groupEndMinuteSelect = document.getElementById('groupEndMinute');

    hours.forEach(hour => {
        personalStartHourSelect.add(new Option(hour, hour));
        personalEndHourSelect.add(new Option(hour, hour));
        groupStartHourSelect.add(new Option(hour, hour));
        groupEndHourSelect.add(new Option(hour, hour));
    });

    minutes.forEach(minute => {
        personalStartMinuteSelect.add(new Option(minute, minute));
        personalEndMinuteSelect.add(new Option(minute, minute));
        groupStartMinuteSelect.add(new Option(minute, minute));
        groupEndMinuteSelect.add(new Option(minute, minute));
    });
}

function personalValidateEndTime() {
    const personalStartHour = parseInt(document.getElementById('personalStartHour').value, 10);
    const personalStartMinute = parseInt(document.getElementById('personalStartMinute').value, 10);
    const personalEndHour = parseInt(document.getElementById('personalEndHour').value, 10);
    const personalEndMinute = parseInt(document.getElementById('personalEndMinute').value, 10);

    const personalStartTime = personalStartHour * 60 + personalStartMinute;
    const personalEndTime = personalEndHour * 60 + personalEndMinute;

    if (personalEndTime <= personalStartTime) {
        const newPersonalEndTime = personalStartTime + 15;
        document.getElementById('personalEndHour').value = String(Math.floor(newPersonalEndTime / 60)).padStart(2, '0');
        document.getElementById('personalEndMinute').value = String(newPersonalEndTime % 60).padStart(2, '0');
    }
}

function groupValidateEndTime() {
    const groupStartHour = parseInt(document.getElementById('groupStartHour').value, 10);
    const groupStartMinute = parseInt(document.getElementById('groupStartMinute').value, 10);
    const groupEndHour = parseInt(document.getElementById('groupEndHour').value, 10);
    const groupEndMinute = parseInt(document.getElementById('groupEndMinute').value, 10);

    const groupStartTime = groupStartHour * 60 + groupStartMinute;
    const groupEndTime = groupEndHour * 60 + groupEndMinute;

    if (groupEndTime <= groupStartTime) {
        const newGroupEndTime = groupStartTime + 15;
        document.getElementById('groupEndHour').value = String(Math.floor(newGroupEndTime / 60)).padStart(2, '0');
        document.getElementById('groupEndMinute').value = String(newGroupEndTime % 60).padStart(2, '0');
    }
}

document.addEventListener('change', (event) => {
    if (event.target.id.includes('personalStart') || event.target.id.includes('personalEnd')) {
        personalValidateEndTime();
    }
    if (event.target.id.includes('groupStart') || event.target.id.includes('groupEnd')) {
        groupValidateEndTime();
    }
});

document.getElementById('personalDate').addEventListener('change', function () {
    const selectedDate = this.value;
    const teacherId = localStorage.getItem('selectedGroupTeacherId'); // Đọc teacherId từ Local Storage
    if (selectedDate) { // Kiểm tra xem người dùng đã chọn ngày chưa
        fetchPersonalFreeTimes(selectedDate, teacherId);
    } else {
        document.getElementById('personalFreeTimesAvailable').style.display = 'none'; // Ẩn các mục nếu người dùng xóa ngày đã chọn
        document.getElementById('personalAppointmentDetails').style.display = 'none'; // Ẩn các mục nếu người dùng xóa ngày đã chọn
    }
});

document.getElementById('groupDate').addEventListener('change', function () {
    const selectedDate = this.value;
    const teacherId = localStorage.getItem('selectedGroupTeacherId'); // Đọc teacherId từ Local Storage
    const groupId = localStorage.getItem('selectedGroupId'); // Đọc groupId từ Local Storage
    if (selectedDate) { // Kiểm tra xem người dùng đã chọn ngày chưa
        fetchGroupFreeTimes(selectedDate, teacherId, groupId);
    } else {
        document.getElementById('groupFreeTimesAvailable').style.display = 'none'; // Ẩn các mục nếu người dùng xóa ngày đã chọn
        document.getElementById('groupAppointmentDetails').style.display = 'none'; // Ẩn các mục nếu người dùng xóa ngày đã chọn
    }
});

function checkSelectedPersonalTimeAgainstFreeTimes() {
    let startHour = parseInt(document.getElementById('personalStartHour').value, 10);
    let startMinute = parseInt(document.getElementById('personalStartMinute').value, 10);
    let endHour = parseInt(document.getElementById('personalEndHour').value, 10) || startHour;
    let endMinute = parseInt(document.getElementById('personalEndMinute').value, 10);

    if (endHour === 0 || endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        endHour = startHour;
        endMinute = startMinute + 15; // Thêm 15 phút làm giá trị mặc định
        if (endMinute >= 60) {
            endHour += 1;
            endMinute -= 60;
        }
    }

    const selectedStartTime = startHour * 60 + startMinute;
    const selectedEndTime = endHour * 60 + endMinute;
    console.log(selectedStartTime, selectedEndTime);

    // Check if selected time is within free times
    let isValidTime = false;
    for (const freeTime of personalFreeTimes) {
        const freeStart = parseInt(freeTime.free_start.split(':')[0], 10) * 60 + parseInt(freeTime.free_start.split(':')[1], 10);
        const freeEnd = parseInt(freeTime.free_end.split(':')[0], 10) * 60 + parseInt(freeTime.free_end.split(':')[1], 10);
        console.log(freeStart, freeEnd);

        if (selectedStartTime >= freeStart && selectedEndTime <= freeEnd) {
            isValidTime = true;
            document.getElementById('personalAppointmentTimeWarning').style.display = 'none';
            document.getElementById('personalAppointmentLocationAndDescription').style.display = 'block';
            break;
        }
    }
    // Display warning if selected time is not valid
    if (!isValidTime) {
        document.getElementById('personalAppointmentTimeWarning').style.display = 'block';
        document.getElementById('personalAppointmentLocationAndDescription').style.display = 'none';
    }
}

function checkSelectedGroupTimeAgainstFreeTimes() {
    let startHour = parseInt(document.getElementById('groupStartHour').value, 10);
    let startMinute = parseInt(document.getElementById('groupStartMinute').value, 10);
    let endHour = parseInt(document.getElementById('groupEndHour').value, 10) || startHour;
    let endMinute = parseInt(document.getElementById('groupEndMinute').value, 10);

    if (endHour === 0 || endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        endHour = startHour;
        endMinute = startMinute + 15; // Thêm 15 phút làm giá trị mặc định
        if (endMinute >= 60) {
            endHour += 1;
            endMinute -= 60;
        }
    }

    const selectedStartTime = startHour * 60 + startMinute;
    const selectedEndTime = endHour * 60 + endMinute;
    console.log(selectedStartTime, selectedEndTime);

    // Check if selected time is within free times
    let isValidTime = false;
    for (const freeTime of groupFreeTimes) {
        const freeStart = parseInt(freeTime.free_start.split(':')[0], 10) * 60 + parseInt(freeTime.free_start.split(':')[1], 10);
        const freeEnd = parseInt(freeTime.free_end.split(':')[0], 10) * 60 + parseInt(freeTime.free_end.split(':')[1], 10);
        console.log(freeStart, freeEnd);

        if (selectedStartTime >= freeStart && selectedEndTime <= freeEnd) {
            isValidTime = true;
            document.getElementById('groupAppointmentTimeWarning').style.display = 'none';
            document.getElementById('groupAppointmentLocationAndDescription').style.display = 'block';
            break;
        }
    }

    // Display warning if selected time is not valid
    if (!isValidTime) {
        document.getElementById('groupAppointmentTimeWarning').style.display = 'block';
        document.getElementById('groupAppointmentLocationAndDescription').style.display = 'none';
    }
}

// Attach the check function to the time selection event
document.getElementById('personalStartMinute').addEventListener('change', checkSelectedPersonalTimeAgainstFreeTimes);
document.getElementById('personalStartHour').addEventListener('change', checkSelectedPersonalTimeAgainstFreeTimes);
document.getElementById('personalEndMinute').addEventListener('change', checkSelectedPersonalTimeAgainstFreeTimes);
document.getElementById('personalEndHour').addEventListener('change', checkSelectedPersonalTimeAgainstFreeTimes);
document.getElementById('groupStartMinute').addEventListener('change', checkSelectedGroupTimeAgainstFreeTimes);
document.getElementById('groupStartHour').addEventListener('change', checkSelectedGroupTimeAgainstFreeTimes);
document.getElementById('groupEndMinute').addEventListener('change', checkSelectedGroupTimeAgainstFreeTimes);
document.getElementById('groupEndHour').addEventListener('change', checkSelectedGroupTimeAgainstFreeTimes);

document.getElementById('saveAppointmentButton').addEventListener('click', function () {
    const isPersonalAppointmentActive = document.getElementById('personal-appointment-tab').classList.contains('active');
    if (isPersonalAppointmentActive) {
        // Lưu lịch hẹn cá nhân
        savePersonalAppointment();
    } else {
        // Lưu lịch hẹn nhóm
        saveGroupAppointment();
    }
});

function savePersonalAppointment() {
    const selectedDate = document.getElementById('personalDate').value;
    const startHour = document.getElementById('personalStartHour').value;
    const startMinute = document.getElementById('personalStartMinute').value;
    const endHour = document.getElementById('personalEndHour').value;
    const endMinute = document.getElementById('personalEndMinute').value;
    const location = document.getElementById('personalLocation').value;
    const description = document.getElementById('personalDescription').value;
    const groupId = localStorage.getItem('selectedGroupId');

    const start = `${selectedDate} ${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00`;
    const end = `${selectedDate} ${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}:00`;

    if (!selectedDate || (startHour === '00' && startMinute === '00' && endHour === '00' && endMinute === '00') || document.getElementById('personalAppointmentTimeWarning').style.display === 'block') {
        alert('Khung thời gian không hợp lệ.');
        return;
    }

    fetch(`/Student/createPersonalAppointment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            groupId,
            start,
            end,
            description,
            location,
        }),
    })
        .then(response => response.json())
        .then(data => {
            clearAppointmentsTable();
            fetchAppointments(localStorage.getItem('selectedGroupId'));
            var myModal = bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal'));
            myModal.hide();
            clearAppointmentsTable();
        })
        .catch(error => {
            console.error('Error creating appointment:', error);
            alert('Failed to create appointment');
        });
    document.getElementById('personalDate').value = ''; // Đặt lại ngày
    document.getElementById('personalStartHour').value = ''; // Đặt lại giờ bắt đầu
    document.getElementById('personalStartMinute').value = ''; // Đặt lại phút bắt đầu
    document.getElementById('personalEndHour').value = ''; // Đặt lại giờ kết thúc
    document.getElementById('personalEndMinute').value = ''; // Đặt lại phút kết thúc
    document.getElementById('personalLocation').value = ''; // Đặt lại địa điểm
    document.getElementById('personalDescription').value = ''; // Đặt lại mô tả

    // Ẩn cảnh báo thời gian không hợp lệ nếu nó được hiển thị
    document.getElementById('personalFreeTimesAvailable').style.display = 'none';
    document.getElementById('personalAppointmentDetails').style.display = 'none';
    document.getElementById('personalAppointmentLocationAndDescription').style.display = 'none';
}

function saveGroupAppointment() {
    const selectedDate = document.getElementById('groupDate').value;
    const startHour = document.getElementById('groupStartHour').value;
    console.log(startHour);
    const startMinute = document.getElementById('groupStartMinute').value;
    const endHour = document.getElementById('groupEndHour').value;
    const endMinute = document.getElementById('groupEndMinute').value;
    const location = document.getElementById('groupLocation').value;
    const description = document.getElementById('groupDescription').value;
    const groupId = localStorage.getItem('selectedGroupId');

    const start = `${selectedDate} ${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00`;
    const end = `${selectedDate} ${endHour.padStart(2, '0')}:${endMinute.padStart(2, '0')}:00`;

    if (!selectedDate || (startHour === '00' && startMinute === '00' && endHour === '00' && endMinute === '00') || document.getElementById('groupAppointmentTimeWarning').style.display === 'block') {
        alert('Khung thời gian không hợp lệ.');
        return;
    }

    fetch(`/Student/createGroupAppointment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            groupId,
            start,
            end,
            description,
            location,
        }),
    })
        .then(response => response.json())
        .then(data => {
            clearAppointmentsTable();
            fetchAppointments(localStorage.getItem('selectedGroupId'));
            var myModal = bootstrap.Modal.getInstance(document.getElementById('addAppointmentModal'));
            myModal.hide();
            clearAppointmentsTable();
        })
        .catch(error => {
            console.error('Error creating appointment:', error);
            alert('Failed to create appointment');
        });
    document.getElementById('groupDate').value = ''; // Đặt lại ngày
    document.getElementById('groupStartHour').value = ''; // Đặt lại giờ bắt đầu
    document.getElementById('groupStartMinute').value = ''; // Đặt lại phút bắt đầu
    document.getElementById('groupEndHour').value = ''; // Đặt lại giờ kết thúc
    document.getElementById('groupEndMinute').value = ''; // Đặt lại phút kết thúc
    document.getElementById('groupLocation').value = ''; // Đặt lại địa điểm
    document.getElementById('groupDescription').value = ''; // Đặt lại mô tả

    // Ẩn cảnh báo thời gian không hợp lệ nếu nó được hiển thị
    document.getElementById('groupFreeTimesAvailable').style.display = 'none';
    document.getElementById('groupAppointmentDetails').style.display = 'none';
    document.getElementById('groupAppointmentLocationAndDescription').style.display = 'none';
}

function clearAppointmentsTable() {
    const appointmentTableBody = document.getElementById('appointment-table-body');
    while (appointmentTableBody.firstChild) {
        appointmentTableBody.removeChild(appointmentTableBody.firstChild);
    }
}