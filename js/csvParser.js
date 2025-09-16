/**
 * CSV Parser Utility for Rugby Auth Portal
 * Handles parsing and management of user data from CSV files
 */

class CSVParser {
    constructor() {
        this.users = [];
        this.isLoaded = false;
    }

    /**
     * Parse CSV text into array of objects
     * @param {string} csvText - Raw CSV content
     * @returns {Array} Array of user objects
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(header => header.trim());
        const users = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const user = {};
                headers.forEach((header, index) => {
                    user[header] = values[index].trim();
                });
                users.push(user);
            }
        }

        return users;
    }

    /**
     * Parse a single CSV line handling quoted values
     * @param {string} line - CSV line to parse
     * @returns {Array} Array of values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * Load user data from CSV file
     * @param {string} csvFilePath - Path to CSV file
     * @returns {Promise<Array>} Promise resolving to user array
     */
    async loadUsers(csvFilePath = '../data/users.csv') {
        try {
            const response = await fetch(csvFilePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            this.users = this.parseCSV(csvText);
            this.isLoaded = true;
            
            console.log(`✅ Loaded ${this.users.length} users from CSV`);
            return this.users;
        } catch (error) {
            console.error('❌ Error loading CSV file:', error);
            // Fallback to demo data if CSV fails to load
            this.users = this.getFallbackUsers();
            this.isLoaded = true;
            console.warn('⚠️  Using fallback demo users');
            return this.users;
        }
    }

    /**
     * Get fallback demo users if CSV fails to load
     * @returns {Array} Demo user data
     */
    getFallbackUsers() {
        return [
            { 
                email: 'admin@rugbyauth.com', 
                password: 'AdminPass123', 
                role: 'admin',
                firstName: 'Jean',
                lastName: 'Dupont',
                position: 'Administrateur',
                team: 'Management',
                joinDate: '2024-01-15',
                status: 'active'
            },
            { 
                email: 'coach@rugbyauth.com', 
                password: 'CoachPass123', 
                role: 'coach',
                firstName: 'Pierre',
                lastName: 'Martin',
                position: 'Entraîneur Principal',
                team: 'Staff Technique',
                joinDate: '2024-02-01',
                status: 'active'
            },
            { 
                email: 'player@rugbyauth.com', 
                password: 'PlayerPass123', 
                role: 'player',
                firstName: 'Marc',
                lastName: 'Leblanc',
                position: 'Pilier',
                team: 'Première Équipe',
                joinDate: '2024-03-10',
                status: 'active'
            }
        ];
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object|null} User object if authenticated, null otherwise
     */
    authenticateUser(email, password) {
        if (!this.isLoaded) {
            console.warn('⚠️  Users not loaded yet');
            return null;
        }

        const user = this.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password &&
            user.status === 'active'
        );

        if (user) {
            // Return user data without password for security
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    /**
     * Get user by email (without password)
     * @param {string} email - User email
     * @returns {Object|null} User object without password
     */
    getUserByEmail(email) {
        if (!this.isLoaded) return null;

        const user = this.users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() &&
            user.status === 'active'
        );

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    /**
     * Get all active users (without passwords)
     * @returns {Array} Array of user objects without passwords
     */
    getAllUsers() {
        if (!this.isLoaded) return [];

        return this.users
            .filter(user => user.status === 'active')
            .map(user => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
    }

    /**
     * Get users by role
     * @param {string} role - User role to filter by
     * @returns {Array} Array of users with specified role
     */
    getUsersByRole(role) {
        return this.getAllUsers().filter(user => user.role === role);
    }

    /**
     * Get demo credentials for display
     * @returns {Array} Array of demo credential objects
     */
    getDemoCredentials() {
        const demoUsers = this.users.slice(0, 3); // First 3 users as demo
        return demoUsers.map(user => ({
            label: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            email: user.email,
            password: user.password,
            displayName: `${user.firstName} ${user.lastName}`
        }));
    }

    /**
     * Validate CSV data structure
     * @returns {Object} Validation result with status and issues
     */
    validateData() {
        const requiredFields = ['email', 'password', 'role', 'firstName', 'lastName', 'status'];
        const validRoles = ['admin', 'coach', 'player', 'staff'];
        const issues = [];

        this.users.forEach((user, index) => {
            // Check required fields
            requiredFields.forEach(field => {
                if (!user[field] || user[field].trim() === '') {
                    issues.push(`Ligne ${index + 2}: Champ manquant '${field}'`);
                }
            });

            // Check email format
            if (user.email && !this.isValidEmail(user.email)) {
                issues.push(`Ligne ${index + 2}: Format email invalide '${user.email}'`);
            }

            // Check role validity
            if (user.role && !validRoles.includes(user.role.toLowerCase())) {
                issues.push(`Ligne ${index + 2}: Rôle invalide '${user.role}'`);
            }

            // Check status
            if (user.status && !['active', 'inactive', 'suspended'].includes(user.status.toLowerCase())) {
                issues.push(`Ligne ${index + 2}: Statut invalide '${user.status}'`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues: issues,
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.status === 'active').length
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get statistics about loaded users
     * @returns {Object} User statistics
     */
    getStatistics() {
        if (!this.isLoaded) return null;

        const stats = {
            total: this.users.length,
            active: this.users.filter(u => u.status === 'active').length,
            byRole: {},
            byTeam: {},
            recentJoins: 0
        };

        // Count by role
        this.users.forEach(user => {
            if (user.status === 'active') {
                stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
                if (user.team) {
                    stats.byTeam[user.team] = (stats.byTeam[user.team] || 0) + 1;
                }
            }
        });

        // Count recent joins (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        stats.recentJoins = this.users.filter(user => {
            if (!user.joinDate) return false;
            const joinDate = new Date(user.joinDate);
            return joinDate >= thirtyDaysAgo && user.status === 'active';
        }).length;

        return stats;
    }
}

// Create global instance
window.csvParser = new CSVParser();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVParser;
}