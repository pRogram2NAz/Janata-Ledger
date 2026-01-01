/* =========================================
   1. DATABASE LAYER (Simulating Backend)
   ========================================= */
const DB = {
    // Initial Data
    contractors: [
        { 
            id: 1, 
            name: "Himalaya Builders Pvt Ltd", 
            rating: 4.5, 
            skills: "Highways, Bridges", 
            status: "Active",
            currentProjectId: 1, // Currently assigned project (null if free)
            availableFrom: null  // Date when contractor becomes available
        },
        { 
            id: 2, 
            name: "Nepal Infrastructure Corp", 
            rating: 4.2, 
            skills: "Buildings, Roads", 
            status: "Active",
            currentProjectId: null, // This contractor is available
            availableFrom: null
        }
    ],
    projects: [
        { 
            _id: '1', 
            name: 'TIA Airport Extension', 
            type: 'National', 
            budget: 500, 
            guarantee: 10, 
            materials: 'Steel, Concrete', 
            budgetStatus: 'Pending', 
            status: 'In Progress',
            contractorId: 1, 
            teamMembers: "50 Engineers", 
            weeklyReports: [],
            startDate: '2024-01-15',
            tenure: 18, // Tenure in months
            expectedEndDate: '2025-07-15',
            completionPercentage: 35
        }
    ],

    // ============ CONTRACTOR AVAILABILITY METHODS ============

    // Check if contractor is available for new project
    isContractorAvailable: (contractorId) => {
        const contractor = DB.contractors.find(c => c.id === contractorId);
        if (!contractor) return false;
        
        // If no current project, contractor is available
        if (!contractor.currentProjectId) return true;
        
        // Check if current project is completed
        const currentProject = DB.projects.find(p => p._id === contractor.currentProjectId.toString());
        if (currentProject && currentProject.status === 'Completed') return true;
        
        return false;
    },

    // Get contractor's current project details
    getContractorCurrentProject: (contractorId) => {
        const contractor = DB.contractors.find(c => c.id === contractorId);
        if (!contractor || !contractor.currentProjectId) return null;
        
        return DB.projects.find(p => p._id === contractor.currentProjectId.toString());
    },

    // Get contractor availability status with details
    getContractorAvailability: (contractorId) => {
        const contractor = DB.contractors.find(c => c.id === contractorId);
        if (!contractor) return { error: "Contractor not found" };

        const currentProject = DB.getContractorCurrentProject(contractorId);
        
        if (!currentProject || currentProject.status === 'Completed') {
            return {
                isAvailable: true,
                message: "Contractor is available for new projects",
                contractorName: contractor.name
            };
        }

        // Calculate remaining time
        const today = new Date();
        const endDate = new Date(currentProject.expectedEndDate);
        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const remainingMonths = Math.ceil(remainingDays / 30);

        return {
            isAvailable: false,
            contractorName: contractor.name,
            currentProject: {
                name: currentProject.name,
                progress: currentProject.completionPercentage,
                startDate: currentProject.startDate,
                expectedEndDate: currentProject.expectedEndDate,
                tenure: currentProject.tenure
            },
            remainingTime: {
                days: remainingDays > 0 ? remainingDays : 0,
                months: remainingMonths > 0 ? remainingMonths : 0
            },
            message: remainingDays > 0 
                ? `Contractor busy. Available after ${remainingDays} days (${currentProject.expectedEndDate})`
                : "Project tenure completed. Ready for new assignment."
        };
    },

    // Get all available contractors
    getAvailableContractors: () => {
        return DB.contractors.filter(c => DB.isContractorAvailable(c.id));
    },

    // Get all busy contractors with their project details
    getBusyContractors: () => {
        return DB.contractors
            .filter(c => !DB.isContractorAvailable(c.id))
            .map(c => ({
                ...c,
                currentProject: DB.getContractorCurrentProject(c.id),
                availability: DB.getContractorAvailability(c.id)
            }));
    },

    // ============ PROJECT ASSIGNMENT METHODS ============

    // Assign project to contractor (with availability check)
    assignProjectToContractor: (projectId, contractorId) => {
        const project = DB.projects.find(p => p._id === projectId);
        const contractor = DB.contractors.find(c => c.id === contractorId);
        
        if (!project) return { success: false, message: "Project not found" };
        if (!contractor) return { success: false, message: "Contractor not found" };

        // Check availability
        if (!DB.isContractorAvailable(contractorId)) {
            const availability = DB.getContractorAvailability(contractorId);
            return { 
                success: false, 
                message: `Cannot assign project. ${availability.message}`,
                availableFrom: availability.currentProject?.expectedEndDate
            };
        }

        // Calculate expected end date based on tenure
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (project.tenure || 12)); // Default 12 months

        // Assign project
        project.contractorId = contractorId;
        project.status = 'In Progress';
        project.startDate = startDate.toISOString().split('T')[0];
        project.expectedEndDate = endDate.toISOString().split('T')[0];
        project.completionPercentage = 0;

        // Update contractor
        contractor.currentProjectId = parseInt(projectId);
        contractor.availableFrom = endDate.toISOString().split('T')[0];

        return { 
            success: true, 
            message: "Project assigned successfully",
            projectDetails: {
                name: project.name,
                startDate: project.startDate,
                expectedEndDate: project.expectedEndDate,
                tenure: project.tenure
            }
        };
    },

    // Complete a project and free the contractor
    completeProject: (projectId) => {
        const project = DB.projects.find(p => p._id === projectId);
        if (!project) return { success: false, message: "Project not found" };

        // Update project
        project.status = 'Completed';
        project.completionPercentage = 100;
        project.completedDate = new Date().toISOString().split('T')[0];

        // Free the contractor
        const contractor = DB.contractors.find(c => c.id === project.contractorId);
        if (contractor) {
            contractor.currentProjectId = null;
            contractor.availableFrom = null;
        }

        return { 
            success: true, 
            message: "Project completed. Contractor is now available for new projects.",
            contractorFreed: contractor?.name
        };
    },

    // ============ OTHER METHODS ============

    getContractor: (id) => DB.contractors.find(c => c.id === id),
    
    getProjects: (roleType) => {
        if (roleType === 'central') return DB.projects.filter(p => p.type === 'National');
        if (roleType === 'local') return DB.projects.filter(p => p.type === 'Local');
        return DB.projects;
    },

    getProjectsByStatus: (status) => {
        return DB.projects.filter(p => p.status === status);
    },

    updateProjectProgress: (projectId, percentage) => {
        const project = DB.projects.find(p => p._id === projectId);
        if (project) {
            project.completionPercentage = Math.max(0, Math.min(100, percentage));
            return { success: true, progress: project.completionPercentage };
        }
        return { success: false, message: "Project not found" };
    },

    addProjectRequest: (requestData) => {
        const newProject = {
            _id: Date.now().toString(),
            ...requestData,
            budgetStatus: 'Pending',
            status: 'Requested',
            weeklyReports: [],
            completionPercentage: 0,
            startDate: null,
            expectedEndDate: null,
            tenure: requestData.tenure || 12 // Default 12 months
        };
        DB.projects.push(newProject);
        return newProject;
    },

    updateRating: (contractorId, change) => {
        const c = DB.contractors.find(x => x.id === contractorId);
        if(c) c.rating = Math.max(0, Math.min(5, c.rating + change));
    }
};

/* =========================================
   2. APPLICATION LOGIC (Frontend)
   ========================================= */
const app = {
    currentUserRole: null,
    activeContractorTab: 'overview',
    
    // --- Navigation ---
    enterDashboard: (role) => {
        app.currentUserRole = role;
        document.getElementById('role-selection').style.display = 'none';
        document.getElementById('intro-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        app.renderView(role);
    },

    goBack: () => {
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('role-selection').style.display = 'grid';
        document.getElementById('intro-section').style.display = 'block';
        document.getElementById('app-content').innerHTML = '';
        app.currentUserRole = null;
    },

    renderView: (role) => {
        const container = document.getElementById('app-content');
        container.innerHTML = ''; 
        if (role === 'contractor') app.renderContractor(container);
        if (role === 'central') app.renderCentral(container);
        if (role === 'local') app.renderLocal(container);
        if (role === 'citizen') app.renderCitizen(container);
    },

    // --- Contractor View Implementation ---
    renderContractor: (container) => {
        const contractor = DB.getContractor(1); // Mock logged-in user

        // Render Tabs
        let html = `
            <h2>👷 Contractor Dashboard</h2>
            <div class="tab-buttons">
                <button class="tab-btn ${app.activeContractorTab === 'overview' ? 'active' : ''}" onclick="app.switchTab('overview')">Overview & Rating</button>
                <button class="tab-btn ${app.activeContractorTab === 'request' ? 'active' : ''}" onclick="app.switchTab('request')">Request New Budget</button>
                <button class="tab-btn ${app.activeContractorTab === 'active' ? 'active' : ''}" onclick="app.switchTab('active')">Active Projects</button>
            </div>
        `;

        // Render Tab Content
        if (app.activeContractorTab === 'overview') {
            const colorClass = contractor.rating >= 4.5 ? 'rating-high' : (contractor.rating >= 3.8 ? 'rating-mid' : 'rating-low');
            html += `
                <div class="stat-card-grid">
                    <div class="stat-box">
                        <h3>My Rating</h3>
                        <div class="rating-display ${colorClass}">${contractor.rating}</div>
                        <p>Out of 5.0</p>
                    </div>
                    <div class="stat-box">
                        <h3>Company Name</h3>
                        <div style="font-size:1.5rem; font-weight:bold;">${contractor.name}</div>
                    </div>
                </div>
            `;
        } else if (app.activeContractorTab === 'request') {
            html += `
                <div class="stat-box">
                    <h3>Request New Project</h3>
                    <form onsubmit="event.preventDefault(); app.submitRequest(this);">
                        <div class="form-group"><label>Contractor Name</label><input type="text" value="${contractor.name}" readonly></div>
                        <div class="form-group"><label>Project Name</label><input type="text" name="pName" required></div>
                        <div class="form-group"><label>Team Members</label><input type="text" name="pTeam" placeholder="Count or Names" required></div>
                        <div class="form-group"><label>Budget (Cr)</label><input type="number" name="pBudget" step="0.1" required></div>
                        <div class="form-group">
                            <label>Project Type</label>
                            <select name="pType">
                                <option value="Local">Local Government</option>
                                <option value="National">National (Infra)</option>
                            </select>
                        </div>
                        <button type="submit" class="back-btn" style="background:#E65100;">Submit Request</button>
                    </form>
                </div>
            `;
        } else if (app.activeContractorTab === 'active') {
            const projects = DB.getProjects('all'); // Get all for this demo
            if(projects.length === 0) html += `<p>No projects yet.</p>`;
            
            projects.forEach(p => {
                const isWeekend = app.checkIsWeekend();
                const statusStyle = isWeekend ? 'unlocked' : 'locked';
                const btnState = isWeekend ? '' : 'disabled';
                const btnStyle = isWeekend ? 'background:green; color:white;' : 'background:grey; color:white;';
                
                html += `
                    <div class="stat-box" style="text-align:left; margin-bottom:20px;">
                        <h3>${p.name}</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:10px 0;">
                            <div><small>Guarantee (Read Only)</small><input type="text" value="${p.guarantee} yrs" readonly></div>
                            <div><small>Materials</small><input type="text" value="${p.materials}"></div>
                        </div>
                        <div style="padding:10px; border:2px solid #ddd; border-radius:5px;" class="${statusStyle}">
                            <h4>Weekly Report</h4>
                            <p>${isWeekend ? 'Open' : 'Locked (Weekends Only)'}</p>
                            <textarea rows="2" style="width:100%; margin-top:5px;" ${btnState}></textarea>
                            <button style="margin-top:5px; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; ${btnStyle}" ${btnState}>Submit</button>
                        </div>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    },

    // --- Other Roles Implementation ---
    renderCentral: (container) => {
        const projects = DB.getProjects('central');
        let html = `<h2>Ministry of Infrastructure</h2><table><tr><th>Project</th><th>Budget</th><th>Action</th></tr>`;
        projects.forEach(p => {
            html += `<tr><td>${p.name}</td><td>${p.budget} Cr</td><td><button onclick="alert('Approved via Blockchain')" class="back-btn" style="background:#003366; padding:5px;">Approve</button></td></tr>`;
        });
        html += `</table>`;
        container.innerHTML = html;
    },

    renderLocal: (container) => {
        const projects = DB.getProjects('local');
        let html = `<h2>Local Government</h2><table><tr><th>Project</th><th>Team</th><th>Action</th></tr>`;
        projects.forEach(p => {
            html += `<tr><td>${p.name}</td><td>${p.teamMembers}</td><td><button onclick="alert('Approved')" class="back-btn" style="background:#2E7D32; padding:5px;">Approve</button></td></tr>`;
        });
        html += `</table>`;
        container.innerHTML = html;
    },

    renderCitizen: (container) => {
        const contractor = DB.getContractor(1);
        container.innerHTML = `
            <h2>Citizen Dashboard</h2>
            <div class="stat-box">
                <h3>${contractor.name}</h3>
                <p>Current Rating: ${contractor.rating}</p>
                <button class="back-btn" style="background:#4A148C;" onclick="alert('Please provide ID Proof to reduce rating.')">Report Issue / Reduce Rating</button>
            </div>
        `;
    },

    // --- Helper Functions ---
    switchTab: (tabName) => {
        app.activeContractorTab = tabName;
        app.renderContractor(document.getElementById('app-content'));
    },

    submitRequest: (form) => {
        const data = {
            contractorId: 1,
            name: form.pName.value,
            teamMembers: form.pTeam.value,
            budget: form.pBudget.value,
            type: form.pType.value,
            guarantee: 5, // Default
            materials: "Pending"
        };
        DB.addProjectRequest(data);
        alert("Request Submitted to Government!");
        app.switchTab('active');
    },

    checkIsWeekend: () => {
        // Uncomment below for demo purposes:
        // return true;
        const day = new Date().getDay();
        return day === 0 || day === 6;
    }
};