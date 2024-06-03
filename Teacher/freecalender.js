document.addEventListener('DOMContentLoaded', () => {
  fetchFreeTimes();
});

function fetchFreeTimes() {
    fetch('/freetimes')
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector('#current-free-times');
            container.innerHTML = ''; // Clear the existing content before adding new
            
            // Create table
            const table = document.createElement('table');
            table.classList.add('table'); // Add Bootstrap table class
            
            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th class="text-center">Ngày</th>
                    <th class="text-center">Thời gian bắt đầu</th>
                    <th class="text-center">Thời gian kết thúc</th>
                    <th class="text-center">Thao tác</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // Add data to table
            data.forEach(freeTime => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="align-middle text-center">${new Date(freeTime.date).toLocaleDateString()}</td>
                    <td class="align-middle text-center">${freeTime.start_time}</td>
                    <td class="align-middle text-center">${freeTime.end_time}</td>
                    <td class="align-middle text-center py-3"><button onclick="deleteFreeTime(${freeTime.id})" class="btn btn-danger btn-rectangle">Xóa</button></td>
                `;
                table.appendChild(row);
            });
            
            container.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching free times:', error);
            alert('Error fetching free times: ' + error.message);
        });
}

function saveFreeTime() {
  const date = document.getElementById('date').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  fetch('/add-freetime', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, startTime, endTime }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          fetchFreeTimes();
          Swal.fire({
              title: 'Success!',
              text: 'Free time added successfully.',
              icon: 'success',
              confirmButtonText: 'OK'
          });

          // Reset the input fields
          document.getElementById('date').value = '';
          document.getElementById('startTime').value = '';
          document.getElementById('endTime').value = '';
      } else {
          throw new Error(data.message);
      }
  })
  .catch(error => {
      console.error('Error saving free time:', error);
      Swal.fire({
          title: 'Error!',
          text: 'Error saving free time: ' + error.message,
          icon: 'error',
          confirmButtonText: 'OK'
      });
  });
}

function deleteFreeTime(id) {
    fetch(`/delete-freetime/${id}`, { method: 'DELETE' })
    .then(response => response.text())
    .then(message => {
        console.log(message);
        fetchFreeTimes(); // Refresh the list after deletion
        Swal.fire({
            title: 'Deleted!',
            text: 'Your free time has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    })
    .catch(error => {
        console.error('Error deleting free time:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to delete free time.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}
