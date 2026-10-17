let currentModalType = '';

$(document).ready(function () {
    loadProfile();
    loadSkills();
    loadExperiences();
    loadProjects();
    loadEducation();

    // Profile modal event listeners
    $('#open-profile-modal').on('click', function () {
        $('#profile-modal').css('display', 'flex').hide().fadeIn();
    });

    // Profile AJAX submission (supports multipart/form-data for image uploads)
    $('#profile-form').on('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: '/api/profile',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.success) {
                    $('#profile-modal').fadeOut();
                    loadProfile();
                }
            },
            error: function (xhr) {
                alert('Profile update failed: ' + (xhr.responseJSON?.error || 'Unknown error'));
            }
        });
    });

    // Dynamic Generic Form Submission
    $('#item-form').on('submit', function (e) {
        e.preventDefault();
        const payload = {};
        $(this).serializeArray().forEach(item => {
            payload[item.name] = item.value;
        });

        const endpoints = {
            skill: { url: '/api/skills', refresh: loadSkills },
            experience: { url: '/api/experiences', refresh: loadExperiences },
            project: { url: '/api/projects', refresh: loadProjects },
            education: { url: '/api/education', refresh: loadEducation }
        };

        const target = endpoints[currentModalType];
        if (!target) return;

        $.ajax({
            url: target.url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function () {
                $('#item-modal').fadeOut();
                target.refresh();
            },
            error: function (err) {
                alert('Error creating record: ' + err.statusText);
            }
        });
    });
});

// ==================== AJAX LOADERS ====================

function loadProfile() {
    $.getJSON('/api/profile', function (res) {
        if (!res.data) return;
        const d = res.data;
        $('#brand-name').text(d.full_name || 'My Portfolio');
        $('#hero-name').text(d.full_name || 'Set Your Name');
        $('#hero-headline').text(d.headline || '');
        $('#hero-bio').text(d.bio || '');

        if (d.profile_image) {
            $('#avatar-img').attr('src', d.profile_image);
        }

        $('#hero-email').attr('href', 'mailto:' + (d.email || '#')).text(d.email || 'No Email');
        $('#hero-github').attr('href', d.github || '#').toggle(!!d.github);
        $('#hero-linkedin').attr('href', d.linkedin || '#').toggle(!!d.linkedin);

        // Pre-fill edit modal fields
        $('#input-name').val(d.full_name || '');
        $('#input-headline').val(d.headline || '');
        $('#input-bio').val(d.bio || '');
        $('#input-email').val(d.email || '');
        $('#input-github').val(d.github || '');
        $('#input-linkedin').val(d.linkedin || '');
    });
}

function loadSkills() {
    $.getJSON('/api/skills', function (res) {
        const container = $('#skills-container').empty();
        res.data.forEach(item => {
            container.append(`
                <div class="card">
                    <div class="actions">
                        <button class="btn btn-danger" onclick="deleteItem('skills', ${item.id})">Delete</button>
                    </div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p style="color: var(--accent); font-size: 0.85rem;">${escapeHtml(item.category)}</p>
                    <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 4px; margin-top: 0.8rem; overflow: hidden;">
                        <div style="width: ${item.proficiency}%; background: var(--accent); height: 100%;"></div>
                    </div>
                </div>
            `);
        });
    });
}

function loadExperiences() {
    $.getJSON('/api/experiences', function (res) {
        const container = $('#experience-container').empty();
        res.data.forEach(item => {
            container.append(`
                <div class="card">
                    <div class="actions">
                        <button class="btn btn-danger" onclick="deleteItem('experiences', ${item.id})">Delete</button>
                    </div>
                    <h3>${escapeHtml(item.role)}</h3>
                    <p style="color: var(--accent); font-weight: 500;">${escapeHtml(item.company)} | ${escapeHtml(item.duration)}</p>
                    <p style="color: var(--text-dim); margin-top: 0.5rem;">${escapeHtml(item.description)}</p>
                </div>
            `);
        });
    });
}

function loadProjects() {
    $.getJSON('/api/projects', function (res) {
        const container = $('#projects-container').empty();
        res.data.forEach(item => {
            container.append(`
                <div class="card">
                    <div class="actions">
                        <button class="btn btn-danger" onclick="deleteItem('projects', ${item.id})">Delete</button>
                    </div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p style="color: var(--text-dim); margin: 0.5rem 0;">${escapeHtml(item.description)}</p>
                    <div><span class="tag">${escapeHtml(item.tech_stack || 'General')}</span></div>
                    ${item.project_url ? `<a href="${escapeHtml(item.project_url)}" target="_blank" style="color: var(--accent); display: inline-block; margin-top: 0.6rem; font-size: 0.85rem;">View Source / Demo &rarr;</a>` : ''}
                </div>
            `);
        });
    });
}

function loadEducation() {
    $.getJSON('/api/education', function (res) {
        const container = $('#education-container').empty();
        res.data.forEach(item => {
            container.append(`
                <div class="card">
                    <div class="actions">
                        <button class="btn btn-danger" onclick="deleteItem('education', ${item.id})">Delete</button>
                    </div>
                    <h3>${escapeHtml(item.degree)}</h3>
                    <p style="color: var(--accent);">${escapeHtml(item.institution)} (${escapeHtml(item.year)})</p>
                    <p style="color: var(--text-dim); font-size: 0.9rem; margin-top: 0.4rem;">${escapeHtml(item.details || '')}</p>
                </div>
            `);
        });
    });
}

// ==================== REUSABLE MODAL & CRUD ACTIONS ====================

function openAddModal(type) {
    currentModalType = type;
    const dynamicFields = $('#dynamic-fields').empty();

    if (type === 'skill') {
        $('#modal-heading').text('Add New Skill');
        dynamicFields.html(`
            <div class="form-group"><label>Skill Name</label><input type="text" name="name" required></div>
            <div class="form-group"><label>Category</label>
                <select name="category">
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Database">Database</option>
                    <option value="Tools">Tools</option>
                </select>
            </div>
            <div class="form-group"><label>Proficiency (%)</label><input type="number" min="1" max="100" name="proficiency" value="85"></div>
        `);
    } else if (type === 'experience') {
        $('#modal-heading').text('Add Experience');
        dynamicFields.html(`
            <div class="form-group"><label>Role / Position</label><input type="text" name="role" required></div>
            <div class="form-group"><label>Company / Organization</label><input type="text" name="company" required></div>
            <div class="form-group"><label>Duration</label><input type="text" name="duration" placeholder="e.g. Jun 2024 - Present" required></div>
            <div class="form-group"><label>Description</label><textarea name="description" rows="3"></textarea></div>
        `);
    } else if (type === 'project') {
        $('#modal-heading').text('Add Project');
        dynamicFields.html(`
            <div class="form-group"><label>Project Title</label><input type="text" name="title" required></div>
            <div class="form-group"><label>Tech Stack</label><input type="text" name="tech_stack" placeholder="Node.js, Express, MySQL"></div>
            <div class="form-group"><label>Project / Demo URL</label><input type="url" name="project_url"></div>
            <div class="form-group"><label>Description</label><textarea name="description" rows="3"></textarea></div>
        `);
    } else if (type === 'education') {
        $('#modal-heading').text('Add Education');
        dynamicFields.html(`
            <div class="form-group"><label>Degree / Certificate</label><input type="text" name="degree" required></div>
            <div class="form-group"><label>Institution</label><input type="text" name="institution" required></div>
            <div class="form-group"><label>Year</label><input type="text" name="year" placeholder="2022 - 2026" required></div>
            <div class="form-group"><label>Details</label><input type="text" name="details"></div>
        `);
    }

    $('#item-modal').css('display', 'flex').hide().fadeIn();
}

function deleteItem(endpoint, id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    $.ajax({
        url: `/api/${endpoint}/${id}`,
        type: 'DELETE',
        success: function () {
            if (endpoint === 'skills') loadSkills();
            if (endpoint === 'experiences') loadExperiences();
            if (endpoint === 'projects') loadProjects();
            if (endpoint === 'education') loadEducation();
        },
        error: function (err) {
            alert('Failed to delete item: ' + err.statusText);
        }
    });
}

function escapeHtml(string) {
    return String(string || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}