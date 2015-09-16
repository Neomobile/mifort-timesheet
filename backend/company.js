var dbSettings = require('./libs/mongodb_settings');
var users = require('./user');
var utils = require('./libs/utils');
var moment = require('moment');

//Rest API
exports.restFindById = function(req, res) {
    var companyId = utils.getCompanyId(req, res);
    if(companyId) {
        findById(companyId, function(err, company) {
            if(err) {
                res.status(400).json({error: 'Cannot find company!'});
            } else {
                res.json(company);
            }
        });
    }
};

exports.restCreateCompany = function(req, res) {
    var company = req.body;
    if(company) {
        save(company, function(err, savedCompany) {
            if(err) {
                res.status(500).json(err);        
            } else {
                createUsersByEmails(savedCompany);
                res.json(savedCompany);
            }
        });
    } else {
        res.status(500).json({error: 'Empty request body'});
    }
};

//Public API
exports.save = save;

exports.generateDefaultCompany = function() {
    var periods = [];
    
    var firstPeriod = {
        start: moment.utc().toDate(),
        end: moment.utc().endOf('week').toDate()
    };
    periods.push(firstPeriod);
    
    //generate 53 weeks (1 year)
    var startDate = moment.utc(firstPeriod.end).add(1,'day').toDate();
    var endDate = moment.utc(startDate).endOf('week').toDate();
    for (var i = 0; i < 53; i++) {
        periods.push({
            start: startDate,
            end: endDate
        });
        startDate = moment.utc(endDate).add(1,'day').toDate();
        endDate = moment.utc(startDate).endOf('week').toDate();
    };

    var company = {
        template : {
            date: "",
            role: "",
            time: 8,
            comment: ""
        },
        periods: periods
    }

    return company;
};

//private part
function findById(id, callback) {
    var companies = dbSettings.companyCollection();
    companies.findOne({_id: id}, function(err, company){
        callback(err, company);
    });
}

function createUsersByEmails(company) {
    var emails = company.emails;
    if(emails) {
        emails.forEach(function(email) {
            var user = {email: email,
                        companyId: company._id};

            users.findByExample(user, function(err, dbUser) {
                if(err) {
                    console.log(err);
                } else if(!dbUser) {
                    users.save(user, function(err, savedUser) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("User saved:");
                            console.log(savedUser);
                        }
                    });
                }
            });
            
        })
    }
}

function save(company, callback) {
    var companies = dbSettings.companyCollection();
    companies.save(company, {safe:true}, function (err, result) {
        if(result.ops) {
            callback(err, result.ops[0]);
        } else {
            callback(err, company);
        }
    });
};