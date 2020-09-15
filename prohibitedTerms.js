const prohibitedTerms = {
	'whitelist': {
        alternative: 'allowlist',
        severity: 'warn'
    },
	'blacklist': {
        alternative: 'denylist',
        severity: 'warn'
    },
	'master': {
        alternative: 'primary',
        severity: 'warn'
    },
	'slave': {
        alternative: 'secondary',
        severity: 'warn'
    },
	'brownbag': {
        alternative: 'lunch and learn',
        severity: 'warn'
    }
};

module.exports = prohibitedTerms;
