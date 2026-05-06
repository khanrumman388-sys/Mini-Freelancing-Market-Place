class FiverrClone {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.gigs = JSON.parse(localStorage.getItem('gigs')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCategories();
        this.loadGigs();
        this.checkAuth();
        this.filterGigs();
    }

    bindEvents() {
        // Navigation
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('signupBtn').addEventListener('click', () => this.showAuthModal('signup'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Modals
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('gigModal'));
        document.getElementById('closeAuth').addEventListener('click', () => this.closeModal('authModal'));
        
        // Search and Filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchGigs(e.target.value));
        document.getElementById('sortFilter').addEventListener('change', (e) => this.sortGigs(e.target.value));
        
        // Hero buttons
        document.getElementById('buyerBtn').addEventListener('click', () => this.scrollToGigs());
        document.getElementById('sellerBtn').addEventListener('click', () => this.showSellerDashboard());
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal('gigModal');
                this.closeModal('authModal');
            }
        });
    }

    checkAuth() {
        if (this.currentUser) {
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('signupBtn').style.display = 'none';
            document.getElementById('dashboardBtn').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            document.getElementById('profileImg').src = this.currentUser.avatar || 'https://via.placeholder.com/40';
        }
    }

    showAuthModal(type) {
        const modal = document.getElementById('authModal');
        const content = document.getElementById('authContent');
        
        content.innerHTML = `
            <div class="auth-form">
                <h2>${type === 'login' ? 'Login to your account' : 'Create your Fiverr account'}</h2>
                <form id="authForm">
                    ${type === 'signup' ? '<div class="form-group"><input type="text" id="signupName" placeholder="Full Name" required></div>' : ''}
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="${type}Email" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="${type}Password" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%;">${type === 'login' ? 'Login' : 'Sign Up'}</button>
                </form>
                <div class="auth-toggle">
                    ${type === 'login' ? 
                        'Don\'t have an account? <a href="#" onclick="app.showAuthModal(\'signup\')">Sign up</a>' : 
                        'Already have an account? <a href="#" onclick="app.showAuthModal(\'login\')">Login</a>'
                    }
                </div>
            </div>
        `;
        
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (type === 'login') {
                this.login();
            } else {
                this.signup();
            }
        });
        
        modal.style.display = 'block';
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.closeModal('authModal');
            this.checkAuth();
            this.showNotification('Login successful!');
        } else {
            alert('Invalid credentials');
        }
    }

    signup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (this.users.find(u => u.email === email)) {
            alert('Email already exists');
            return;
        }
        
        const user = {
            id: Date.now(),
            name,
            email,
            password,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=1dbf73&color=fff`,
            isSeller: false,
            gigs: [],
            balance: 0
        };
        
        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.closeModal('authModal');
        this.checkAuth();
        this.showNotification('Account created successfully!');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.checkAuth();
        this.showNotification('Logged out successfully!');
    }

    loadCategories() {
        const categories = [
            { name: 'Graphic Design', icon: 'fas fa-palette', color: '#1dbf73' },
            { name: 'Web Development', icon: 'fas fa-code', color: '#007bff' },
            { name: 'Digital Marketing', icon: 'fas fa-bullhorn', color: '#ff6b35' },
            { name: 'Writing & Translation', icon: 'fas fa-pen', color: '#f7931e' },
            { name: 'Video & Animation', icon: 'fas fa-video', color: '#e74c3c' },
            { name: 'Music & Audio', icon: 'fas fa-music', color: '#9b59b6' },
            { name: 'Programming', icon: 'fas fa-laptop-code', color: '#34495e' },
            { name: 'Business', icon: 'fas fa-briefcase', color: '#2ecc71' }
        ];
        
        const grid = document.getElementById('categoryGrid');
        grid.innerHTML = categories.map(cat => `
            <div class="category-card" onclick="app.filterByCategory('${cat.name}')">
                <i class="${cat.icon}" style="color: ${cat.color}"></i>
                <h3>${cat.name}</h3>
            </div>
        `).join('');
    }

    loadGigs(filter = 'all') {
        // Sample gigs
        if (this.gigs.length === 0) {
            this.gigs = [
                {
                    id: 1,
                    title: 'Modern Logo Design',
                    description: 'I will create a modern, professional logo for your brand',
                    price: 50,
                    seller: { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1dbf73' },
                    category: 'Graphic Design',
                    rating: 4.9,
                    reviews: 127,
                    image: '🎨'
                },
                {
                    id: 2,
                    title: 'Responsive Website Development',
                    description: 'I will build a fully responsive website with modern design',
                    price: 300,
                    seller: { name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=007bff' },
                    category: 'Web Development',
                    rating: 5.0,
                    reviews: 89,
                    image: '💻'
                },
                {
                    id: 3,
                    title: 'SEO Optimization & Marketing',
                    description: 'Complete SEO audit and optimization for better rankings',
                    price: 150,
                    seller: { name: 'Mike Johnson', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=ff6b35' },
                    category: 'Digital Marketing',
                    rating: 4.8,
                    reviews: 203,
                    image: '📈'
                },
                {
                    id: 4,
                    title: 'Professional Video Editing',
                    description: 'High-quality video editing for YouTube, social media',
                    price: 100,
                    seller: { name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=e74c3c' },
                    category: 'Video & Animation',
                    rating: 4.9,
                    reviews: 156,
                    image: '🎥'
                }
            ];
            localStorage.setItem('gigs', JSON.stringify(this.gigs));
        }

        this.displayGigs(this.gigs);
    }

    displayGigs(gigs) {
        const grid = document.getElementById('gigsGrid');
        grid.innerHTML = gigs.map(gig => `
            <div class="gig-card" onclick="app.showGigDetails(${gig.id})">
                <div class="gig-image">${gig.image}</div>
                <div class="gig-content">
                    <div class="gig-seller">
                        <img src="${gig.seller.avatar}" class="seller-avatar" alt="${gig.seller.name}">
                        <span>${gig.seller.name}</span>
                    </div>
                    <h3 class="gig-title">${gig.title}</h3>
                    <p class="gig-description">${gig.description}</p>
                    <div class="gig-footer">
                        <div class="gig-price">$${gig.price}</div>
                        <div class="gig-rating">
                            <i class="fas fa-star"></i>
                            <span>${gig.rating}</span>
                            (${gig.reviews})
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showGigDetails(id) {
        const gig = this.gigs.find(g => g.id === id);
        if (!gig) return;

        document.getElementById('gigDetails').innerHTML = `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 300px;">
                    <img src="${gig.seller.avatar}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 1rem;">
                    <h2>${gig.title}</h2>
                    <p style="color: #666; margin-bottom: 2rem;">${gig.description}</p>
                    
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                        <h3>From ${gig.seller.name}</h3>
                        <div style="color: #ffa500; margin: 1rem 0;">
                            <i class="fas fa-star"></i> ${gig.rating} (${gig.reviews} reviews)
                        </div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #1dbf73;">$${gig.price}</div>
                    </div>
                    
                    <button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.2rem;" onclick="app.orderGig(${gig.id})">
                        Continue - $${gig.price}
                    </button>
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <h3>About This Gig</h3>
                    <ul style="color: #666; line-height: 2;">
                        <li>Delivery in 3 days</li>
                        <li>2 Revisions</li>
                        <li>High quality design</li>
                        <li>Source files included</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('gigModal').style.display = 'block';
    }

    orderGig(gigId) {
        if (!this.currentUser) {
            this.showAuthModal('login');
            return;
        }
        alert(`Order placed for gig ${gigId}! (Demo - In real app, this would open checkout)`);
        this.closeModal('gigModal');
    }

    searchGigs(query) {
        const filtered = this.gigs.filter(gig => 
            gig.title.toLowerCase().includes(query.toLowerCase()) ||
            gig.description.toLowerCase().includes(query.toLowerCase()) ||
            gig.seller.name.toLowerCase().includes(query.toLowerCase())
        );
        this.displayGigs(filtered);
    }

    filterByCategory(category) {
        const filtered = category === 'all' ? 
            this.gigs : 
            this.gigs.filter(gig => gig.category === category);
        this.displayGigs(filtered);
    }

    sortGigs(sortBy) {
        let sorted = [...this.gigs];
        switch(sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            default:
                sorted.sort((a, b) => b.id - a.id);
        }
        this.displayGigs(sorted);
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    scrollToGigs() {
        document.querySelector('.gigs').scrollIntoView({ behavior: 'smooth' });
    }

    showSellerDashboard() {
        if (!this.currentUser) {
            this.showAuthModal('signup');
            return;
        }
        alert('Seller Dashboard (Feature coming soon!)');
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #1dbf73;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize app
const app = new FiverrClone();

// Global functions for onclick handlers
function toggleUserMenu() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show');
}