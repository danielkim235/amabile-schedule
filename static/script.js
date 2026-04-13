document.addEventListener('DOMContentLoaded', () => {
    const teamSelect = document.getElementById('teamSelect');
    const customTeam = document.getElementById('customTeam');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const cells = document.querySelectorAll('.cell-data');
    
    let scheduleData = {};

    clearBtn.addEventListener('click', () => {
        if (confirm('정말로 모든 내용을 지우시겠습니까? 저장된 내용까지 초기화하려면 지운 후 [저장하기]를 눌러야 합니다.')) {
            scheduleData = {};
            renderData();
        }
    });

    // Load data on page load
    fetch('/api/schedule')
        .then(response => response.json())
        .then(data => {
            scheduleData = data;
            renderData();
        });

    function getTeamColor(teamName) {
        if (!teamName) return 'white';
        let hash = 0;
        for (let i = 0; i < teamName.length; i++) {
            hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate pastel color (H, S, L)
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 70%, 85%)`;
    }

    function renderData() {
        cells.forEach(cell => {
            const key = cell.dataset.key;
            const team = scheduleData[key];
            if (team) {
                cell.textContent = team;
                cell.classList.add('filled');
                cell.style.backgroundColor = getTeamColor(team);
            } else {
                cell.textContent = '';
                cell.classList.remove('filled');
                cell.style.backgroundColor = 'white';
            }
        });
    }

    teamSelect.addEventListener('change', (e) => {
        if (e.target.value === '직접입력') {
            customTeam.style.display = 'inline-block';
            customTeam.focus();
        } else {
            customTeam.style.display = 'none';
        }
    });

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            let selectedValue = teamSelect.value;
            if (selectedValue === '직접입력') {
                selectedValue = customTeam.value.trim();
            }
            
            const key = cell.dataset.key;
            if (selectedValue) {
                scheduleData[key] = selectedValue;
                cell.textContent = selectedValue;
                cell.classList.add('filled');
                cell.style.backgroundColor = getTeamColor(selectedValue);
            } else {
                delete scheduleData[key];
                cell.textContent = '';
                cell.classList.remove('filled');
                cell.style.backgroundColor = 'white';
            }
        });
    });

    saveBtn.addEventListener('click', () => {
        saveBtn.textContent = '저장 중...';
        saveBtn.disabled = true;
        fetch('/api/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scheduleData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('시간표가 성공적으로 저장되었습니다!');
            }
        })
        .catch(err => {
            alert('저장 중 오류가 발생했습니다.');
            console.error(err);
        })
        .finally(() => {
            saveBtn.textContent = '저장하기';
            saveBtn.disabled = false;
        });
    });

    exportBtn.addEventListener('click', () => {
        window.location.href = '/api/export';
    });
});