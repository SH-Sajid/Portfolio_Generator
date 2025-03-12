// Import jsPDF
const { jsPDF } = window.jspdf;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Tab Functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            tabBtns.forEach(tb => tb.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            btn.classList.add('active');
            const formId = btn.getAttribute('data-tab') + '-form';
            document.getElementById(formId).classList.add('active');
        });
    });
    
    // Authentication forms
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const portfolioContainer = document.getElementById('portfolio-container');
    const authContainer = document.getElementById('auth-container');
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        
        // Reset portfolio form
        document.getElementById('portfolio-form').reset();
        
        // Clear any dynamically added education, work, or project items
        clearDynamicItems();
        
        // Hide portfolio form and show auth forms
        portfolioContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        
        // Reset photo preview
        const photoPreview = document.getElementById('photo-preview');
        photoPreview.src = '';
        photoPreview.style.display = 'none';
        
        // Show logout success message
        showMessage('Logged out successfully!', 'success');
    });
    
    // Clear dynamically added items function
    function clearDynamicItems() {
        document.querySelectorAll('.education-item, .work-item, .project-item').forEach(item => {
            item.remove();
        });
        
        // Reset counters
        educationCount = 1;
        workCount = 1;
        projectCount = 1;
    }
    
    // Make sure we're loading users from localStorage properly
    let users = [];
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }
    } catch (e) {
        console.error('Error loading users from localStorage:', e);
        users = [];
    }
    
    // Debugging: Log loaded users (remove in production)
    console.log('Loaded users:', users);
    
    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const passwordError = document.getElementById('password-error');
        
        // Password validation
        if (password !== confirmPassword) {
            passwordError.style.display = 'block';
            return;
        } else {
            passwordError.style.display = 'none';
        }
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            showMessage('User already exists. Please login.', 'error');
            return;
        }
        
        // Save new user
        users.push({ email, password });
        
        // Ensure users are being saved to localStorage
        try {
            localStorage.setItem('users', JSON.stringify(users));
            console.log('User registered:', email); // Debug
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            showMessage('Registration failed. Please try again.', 'error');
            return;
        }
        
        showMessage('Registration successful! Please login.', 'success');
        
        // Reset form and switch to login tab
        registerForm.reset();
        document.querySelector('[data-tab="login"]').click();
    });
    
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        console.log('Login attempt:', email); // Debug
        
        // Load fresh user data from localStorage
        try {
            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                users = JSON.parse(storedUsers);
            }
        } catch (e) {
            console.error('Error loading users from localStorage:', e);
        }
        
        // Check credentials
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
            // Successfully logged in
            console.log('Login successful for:', email); // Debug
            showMessage('Login successful!', 'success');
            
            // Store logged in user in session
            sessionStorage.setItem('currentUser', email);
            
            // Hide auth forms and show portfolio form
            setTimeout(() => {
                authContainer.classList.add('hidden');
                portfolioContainer.classList.remove('hidden');
            }, 1000); // Small delay to see the success message
        } else {
            console.log('Login failed for:', email); // Debug
            showMessage('Invalid credentials. Please try again.', 'error');
        }
    });
    
    // Check if user is already logged in (on page refresh)
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        authContainer.classList.add('hidden');
        portfolioContainer.classList.remove('hidden');
    }
    
    // Show message function
    function showMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Add to auth container or portfolio container based on which is visible
        if (authContainer.classList.contains('hidden')) {
            portfolioContainer.appendChild(messageElement);
        } else {
            authContainer.appendChild(messageElement);
        }
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
    
    // Photo upload preview
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photo-preview');
    
    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });
    
    // Dynamic form fields - Education
    let educationCount = 1;
    
    // Add Education - Get the button and attach listener
    const addEducationBtn = document.querySelector('#education-section .btn-add');
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', addEducation);
    }
    
    function addEducation() {
        educationCount++;
        const educationSection = document.getElementById('education-section');
        
        const newEducation = document.createElement('div');
        newEducation.className = 'education-item';
        newEducation.dataset.id = educationCount;
        newEducation.innerHTML = `
            <div class="item-header">
                <h4>Education ${educationCount}</h4>
                <button type="button" class="btn-remove">Remove</button>
            </div>
            <div class="form-group">
                <label for="institution${educationCount}">Institution</label>
                <input type="text" id="institution${educationCount}" class="institution" placeholder="Institution">
            </div>
            <div class="form-group">
                <label for="degree${educationCount}">Degree</label>
                <input type="text" id="degree${educationCount}" class="degree" placeholder="Degree">
            </div>
            <div class="form-group">
                <label for="year${educationCount}">Year</label>
                <input type="text" id="year${educationCount}" class="year" placeholder="Year">
            </div>
            <div class="form-group">
                <label for="grade${educationCount}">Grade/GPA</label>
                <input type="text" id="grade${educationCount}" class="grade" placeholder="Grade/GPA">
            </div>
        `;
        
        // Insert before the "Add More" button
        const addButton = educationSection.querySelector('.btn-add');
        educationSection.insertBefore(newEducation, addButton);
        
        // Add event listener to the remove button
        const removeButton = newEducation.querySelector('.btn-remove');
        removeButton.addEventListener('click', function() {
            removeEducation(educationCount);
        });
    }
    
    // Remove Education
    function removeEducation(id) {
        const educationItem = document.querySelector(`.education-item[data-id="${id}"]`);
        if (educationItem) {
            educationItem.remove();
        }
    }
    
    // Dynamic form fields - Work Experience
    let workCount = 1;
    
    // Add Work Experience - Get the button and attach listener
    const addWorkBtn = document.querySelector('#work-experience-section .btn-add');
    if (addWorkBtn) {
        addWorkBtn.addEventListener('click', addWorkExperience);
    }
    
    function addWorkExperience() {
        workCount++;
        const workSection = document.getElementById('work-experience-section');
        
        const newWork = document.createElement('div');
        newWork.className = 'work-item';
        newWork.dataset.id = workCount;
        newWork.innerHTML = `
            <div class="item-header">
                <h4>Work Experience ${workCount}</h4>
                <button type="button" class="btn-remove">Remove</button>
            </div>
            <div class="form-group">
                <label for="company${workCount}">Company Name</label>
                <input type="text" id="company${workCount}" class="company" required>
            </div>
            <div class="form-group">
                <label for="duration${workCount}">Duration</label>
                <input type="text" id="duration${workCount}" class="duration" required>
            </div>
            <div class="form-group">
                <label for="responsibilities${workCount}">Job Responsibilities</label>
                <textarea id="responsibilities${workCount}" class="responsibilities" rows="3" required></textarea>
            </div>
        `;
        
        // Insert before the "Add More" button
        const addButton = workSection.querySelector('.btn-add');
        workSection.insertBefore(newWork, addButton);
        
        // Add event listener to the remove button
        const removeButton = newWork.querySelector('.btn-remove');
        removeButton.addEventListener('click', function() {
            removeWorkExperience(workCount);
        });
    }
    
    // Remove Work Experience
    function removeWorkExperience(id) {
        const workItem = document.querySelector(`.work-item[data-id="${id}"]`);
        if (workItem) {
            workItem.remove();
        }
    }
    
    // Dynamic form fields - Projects
    let projectCount = 1;
    
    // Add Project - Get the button and attach listener
    const addProjectBtn = document.querySelector('#project-section .btn-add');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', addProject);
    }
    
    function addProject() {
        projectCount++;
        const projectSection = document.getElementById('project-section');
        
        const newProject = document.createElement('div');
        newProject.className = 'project-item';
        newProject.dataset.id = projectCount;
        newProject.innerHTML = `
            <div class="item-header">
                <h4>Project ${projectCount}</h4>
                <button type="button" class="btn-remove">Remove</button>
            </div>
            <div class="form-group">
                <label for="projectName${projectCount}">Project Name</label>
                <input type="text" id="projectName${projectCount}" class="projectName" placeholder="Project Name">
            </div>
            <div class="form-group">
                <label for="projectDescription${projectCount}">Description</label>
                <textarea id="projectDescription${projectCount}" class="projectDescription" rows="3" placeholder="Description"></textarea>
            </div>
            <div class="form-group">
                <label for="projectLink${projectCount}">Link (Optional)</label>
                <input type="text" id="projectLink${projectCount}" class="projectLink" placeholder="Link">
            </div>
        `;
        
        // Insert before the "Add More" button
        const addButton = projectSection.querySelector('.btn-add');
        projectSection.insertBefore(newProject, addButton);
        
        // Add event listener to the remove button
        const removeButton = newProject.querySelector('.btn-remove');
        removeButton.addEventListener('click', function() {
            removeProject(projectCount);
        });
    }
    
    // Remove Project
    function removeProject(id) {
        const projectItem = document.querySelector(`.project-item[data-id="${id}"]`);
        if (projectItem) {
            projectItem.remove();
        }
    }
    
    // Portfolio form submission and PDF generation
    const portfolioForm = document.getElementById('portfolio-form');
    
    portfolioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect all form data
        const portfolioData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                contact: document.getElementById('contact').value,
                photo: photoPreview.src,
                bio: document.getElementById('bio').value
            },
            skills: {
                soft: document.getElementById('softSkills').value,
                technical: document.getElementById('technicalSkills').value
            },
            education: collectEducation(),
            workExperience: collectWorkExperience(),
            projects: collectProjects()
        };
        
        // Generate PDF
        generatePDF(portfolioData);
    });
    
    // Collect all education items
    function collectEducation() {
        const education = [];
        
        // Original education item
        const originalInstitution = document.getElementById('institution').value;
        if (originalInstitution) {
            education.push({
                institution: originalInstitution,
                degree: document.getElementById('degree').value,
                year: document.getElementById('year').value,
                grade: document.getElementById('grade').value
            });
        }
        
        // Added education items
        const educationItems = document.querySelectorAll('.education-item');
        educationItems.forEach(item => {
            const institutionInput = item.querySelector('.institution');
            if (institutionInput && institutionInput.value) {
                education.push({
                    institution: institutionInput.value,
                    degree: item.querySelector('.degree').value,
                    year: item.querySelector('.year').value,
                    grade: item.querySelector('.grade').value
                });
            }
        });
        
        return education;
    }
    
    // Collect all work experience items
    function collectWorkExperience() {
        const workExperience = [];
        
        // Original work experience
        const originalCompany = document.getElementById('company').value;
        if (originalCompany) {
            workExperience.push({
                company: originalCompany,
                duration: document.getElementById('duration').value,
                responsibilities: document.getElementById('responsibilities').value
            });
        }
        
        // Added work experiences
        const workItems = document.querySelectorAll('.work-item');
        workItems.forEach(item => {
            const companyInput = item.querySelector('.company');
            if (companyInput && companyInput.value) {
                workExperience.push({
                    company: companyInput.value,
                    duration: item.querySelector('.duration').value,
                    responsibilities: item.querySelector('.responsibilities').value
                });
            }
        });
        
        return workExperience;
    }
    
    // Collect all project items
    function collectProjects() {
        const projects = [];
        
        // Original project
        const originalProjectName = document.getElementById('projectName').value;
        if (originalProjectName) {
            projects.push({
                name: originalProjectName,
                description: document.getElementById('projectDescription').value,
                link: document.getElementById('projectLink').value
            });
        }
        
        // Added projects
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            const projectNameInput = item.querySelector('.projectName');
            if (projectNameInput && projectNameInput.value) {
                projects.push({
                    name: projectNameInput.value,
                    description: item.querySelector('.projectDescription').value,
                    link: item.querySelector('.projectLink').value
                });
            }
        });
        
        return projects;
    }
    
    function generatePDF(data) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;
    
        // Border dimensions
        const borderMargin = 15;
        const borderWidth = pageWidth - (2 * borderMargin);
        const borderHeight = pageHeight - (2 * borderMargin);
    
        // Header with border
        function addHeader() {
            doc.setDrawColor(41, 128, 185);
            doc.setLineWidth(0.5);
            doc.rect(borderMargin, borderMargin, borderWidth, borderHeight);
        }
    
        // Footer
        function addFooter(pageNumber, totalPages) {
            const footerY = borderMargin + borderHeight + 5;
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 25, footerY);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, footerY);
        }
    
        // Precision page break check
        function checkPageBreak(requiredHeight) {
            const remainingSpace = borderMargin + borderHeight - yPos;
            if (requiredHeight > remainingSpace) {
                doc.addPage();
                addHeader();
                yPos = 25;
                return true;
            }
            return false;
        }
    
        // First page setup
        addHeader();
    
        // Personal Info
        doc.setFontSize(26)
           .setFont("helvetica", "bold")
           .setTextColor(44, 62, 80)
           .text(data.personal.fullName, pageWidth / 2, yPos + 5, { align: 'center' });
        
        yPos += 10;
        doc.setFontSize(14)
           .setFont("helvetica", "italic")
           .setTextColor(52, 73, 94)
           .text("Professional Portfolio", pageWidth / 2, yPos + 5, { align: 'center' });
        
        yPos += 15;
        doc.setFontSize(10)
           .setFont("helvetica", "normal")
           .setTextColor(52, 152, 219)
           .text(data.personal.email, pageWidth / 2, yPos + 5, { align: 'center' });
        yPos += 5;
        doc.text(data.personal.contact, pageWidth / 2, yPos + 5, { align: 'center' });
        yPos += 10;
    
        // Profile photo
        if (data.personal.photo) {
            try {
                doc.addImage(data.personal.photo, 'JPEG', pageWidth - 50, 25, 30, 30);
            } catch(e) {
                console.error('Image error:', e);
            }
        }
    
        // Section heading
        function addSectionHeading(title, y) {
            doc.setFillColor(52, 152, 219)
               .rect(20, y, pageWidth - 40, 10, 'F')
               .setFontSize(12)
               .setFont("helvetica", "bold")
               .setTextColor(255, 255, 255)
               .text(title.toUpperCase(), 25, y + 7);
            return y + 15;
        }
    
        // About Section
        yPos = addSectionHeading("About Me", yPos);
        doc.setFont("helvetica", "normal")
           .setFontSize(10)
           .setTextColor(51, 51, 51)
           .text(data.personal.bio, 25, yPos);
        yPos += 15;
    
        // ========== SKILLS SECTION ========== //
        yPos = addSectionHeading("Skills", yPos);
        
        // Soft Skills
        doc.setFontSize(11)
           .setFont("helvetica", "bold")
           .setTextColor(44, 62, 80)
           .text("Soft Skills", 25, yPos);
        yPos += 5;
    
        const softSkills = data.skills.soft.split(',');
        let softSkillX = 25;
        softSkills.forEach(skill => {
            const trimmed = skill.trim();
            if (trimmed) {
                const textWidth = doc.getStringUnitWidth(trimmed) * 10 * 0.352778;
                if (softSkillX + textWidth > pageWidth - 25) {
                    softSkillX = 25;
                    yPos += 8;
                }
                doc.setFontSize(10)
                   .setFont("helvetica", "normal")
                   .setTextColor(0, 0, 0)
                   .text(trimmed, softSkillX, yPos + 2);
                softSkillX += textWidth + 8;
            }
        });
        yPos += 15;
    
        // Technical Skills
        doc.setFontSize(11)
           .setFont("helvetica", "bold")
           .setTextColor(44, 62, 80)
           .text("Technical Skills", 25, yPos);
        yPos += 10;
    
        const techSkills = data.skills.technical.split(',');
        let techSkillX = 25;
        techSkills.forEach(skill => {
            const trimmed = skill.trim();
            if (trimmed) {
                const textWidth = doc.getStringUnitWidth(trimmed) * 10 * 0.352778;
                if (techSkillX + textWidth > pageWidth - 25) {
                    techSkillX = 25;
                    yPos += 8;
                }
                doc.setFontSize(10)
                   .setFont("helvetica", "normal")
                   .setTextColor(0, 0, 0)
                   .text(trimmed, techSkillX, yPos + 2);
                techSkillX += textWidth + 8;
            }
        });
        yPos += 20;
    
        // Education Section
        if (data.education?.length > 0) {
            yPos = addSectionHeading("Education", yPos);
            data.education.forEach(edu => {
                checkPageBreak(25);
                doc.setFontSize(11)
                   .setFont("helvetica", "bold")
                   .setTextColor(44, 62, 80)
                   .text(edu.institution, 25, yPos);
                doc.setFontSize(10)
                   .setFont("helvetica", "italic")
                   .setTextColor(52, 73, 94)
                   .text(`${edu.degree} (${edu.year})`, 25, yPos + 5);
                doc.setFontSize(9)
                   .setFont("helvetica", "normal")
                   .setTextColor(102, 102, 102)
                   .text(`GPA/Grade: ${edu.grade}`, 25, yPos + 10);
                yPos += 20;
            });
        }
    
        // Work Experience
        if (data.workExperience?.length > 0) {
            yPos = addSectionHeading("Work Experience", yPos);
            data.workExperience.forEach(work => {
                const respLines = doc.splitTextToSize(work.responsibilities, pageWidth - 50);
                const entryHeight = 25 + (respLines.length * 5);
                
                if (checkPageBreak(entryHeight)) {
                    yPos = addSectionHeading("Work Experience (cont.)", yPos);
                }
    
                doc.setFontSize(11)
                   .setFont("helvetica", "bold")
                   .setTextColor(44, 62, 80)
                   .text(work.company, 25, yPos);
                doc.setFontSize(10)
                   .setFont("helvetica", "italic")
                   .setTextColor(52, 73, 94)
                   .text(`Duration: ${work.duration}`, 25, yPos + 5);
                
                let bulletY = yPos + 12;
                respLines.forEach(line => {
                    doc.text('•', 25, bulletY);
                    doc.text(line, 30, bulletY);
                    bulletY += 5;
                });
                yPos = bulletY + 5;
            });
        }
    
        // Projects Section
        if (data.projects?.length > 0) {
            yPos = addSectionHeading("Projects", yPos);
            data.projects.forEach(project => {
                const descLines = doc.splitTextToSize(project.description, pageWidth - 50);
                const entryHeight = 20 + (descLines.length * 5) + (project.link ? 10 : 0);
                
                if (checkPageBreak(entryHeight)) {
                    yPos = addSectionHeading("Projects (cont.)", yPos);
                }
    
                doc.setFontSize(11)
                   .setFont("helvetica", "bold")
                   .setTextColor(44, 62, 80)
                   .text(project.name, 25, yPos);
                doc.setFontSize(9)
                   .setFont("helvetica", "normal")
                   .setTextColor(51, 51, 51)
                   .text(descLines, 25, yPos + 5);
                
                yPos += descLines.length * 5 + 5;
                if (project.link) {
                    doc.setTextColor(52, 152, 219)
                       .textWithLink('Project Link', 25, yPos, { url: project.link });
                    yPos += 10;
                }
            });
        }
    
        // Add footers
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(i, totalPages);
        }
    
        doc.save(`${data.personal.fullName.replace(/\s+/g, '_')}_Portfolio.pdf`);
    }
});