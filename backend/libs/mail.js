/*!
 * Copyright 2015 mifort.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Andrew Voitov
 */

 var request = require('request');
 var log = require('./logger');

 var fs = require('fs');
 var ejs = require('ejs');

 var MAIL_API_KEY = process.env.MAIL_API_KEY || 'YOUR_KEY';

 exports.sendInvite = function(to, companyName) {
     fs.readFile(__dirname + '/mail-templates/invite.ejs', 'utf8', function(err, data) {
         if(err) {
             log.error('Cannot read e-mail template', err);
         } else {
             var renderedTemplate = ejs.render(data, {companyName: companyName});
             request.post({ url: 'https://api.mailgun.net/v3/sandbox58f5ee62bef64a6d828414a3340946fa.mailgun.org/messages',
                            formData: {
                                from: '<timesheet-tech@neomobile.com>',
                                to: to,
                                subject: 'Invite to Neomobile Timesheeet',
                                html: renderedTemplate,
                                inline: [
                                    fs.createReadStream(__dirname + '/mail-templates/image/header.jpg')
                                ]
                            },
                            auth: {
                                'user': 'api',
                                'pass': MAIL_API_KEY
                            }
                        },
                        function(err, httpResponse, body){
                            if(err) {
                                log.error('Cannot send e-mail to %s', to, err);
                            } else {
                                log.debug('Invite sending complete: %s', to);
                            }
                        });
         }
     });
 };
