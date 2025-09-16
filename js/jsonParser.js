/**
 * JSON Parser Utility for Rugby à Jojo
 * Handles parsing and management of user data from JSON files
 */
const jsonFilePath = 'data.json'; // Default JSON file path

class JSONParser {
    constructor() {
        this.users = [];
        this.isLoaded = false;
    }

    /**
     * Parse JSON text into array of objects
     * @param {string} texttext - Raw JSON content
     * @returns {Array} Array of user objects
     */
    parseJSON(text) {
        try {
            // Recherche du premier et dernier crochet pour isoler le tableau JSON
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']') + 1;

            if (start === -1 || end === -1) {
                throw new Error("Aucun tableau JSON trouvé dans le texte.");
            }

            const jsonString = text.slice(start, end);
            const jsonArray = JSON.parse(jsonString);

            if (!Array.isArray(jsonArray)) {
                throw new Error("Le contenu JSON extrait n'est pas un tableau.");
            }

            return jsonArray;
        } catch (error) {
            console.error("Erreur lors de l'extraction du tableau JSON :", error.message);
            return [];
        }
    }

    /**
     * Load user data from JSON file
     * @param {string} jsonFilePath - Path to JSON file
     * @returns {Promise<Array>} Promise resolving to user array
     */
    async loadUsers() {
        try {
            const response = await fetch(jsonFilePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonText = await response.text();
            this.users = this.parseJSON(jsonText);
            this.isLoaded = true;

            console.log(`✅ Loaded ${this.users.length} users from JSON`);
            return this.users;
        } catch (error) {
            console.error('❌ Error loading JSON file:', error);
            // Fallback to demo data if JSON fails to load
            this.users = this.getFallbackUsers();
            this.isLoaded = true;
            console.warn('⚠️  Using fallback demo users');
            return this.users;
        }
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
     * Validate JSON data structure
     * @returns {Object} Validation result with status and issues
     */
    validateData() {
        const requiredFields = ['email', 'password', 'role', 'status'];
        const validRole = ['admin', 'player'];
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
            if (user.role && !validRole.includes(user.role.toLowerCase())) {
                issues.push(`Ligne ${index + 2}: Role invalide '${user.role}'`);
            }

            // Check access
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

    addUser(mailTexte, motDePasse) {
        const newUser = {
            email: mailTexte,
            password: motDePasse,
            role: 'player',
            status: 'inactive'
        };
        this.users.push(newUser);
        return this.users;
    }
}

// Create global instance
window.JSONParser = new JSONParser();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONParser;
}