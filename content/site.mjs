// Shared site facts and labels. Do not add details that are not in the client's source material.
export const SITE={
  name:'House of Tangents',short:'HOT',url:'https://house-of-tangents.vercel.app',
  email:'farhafatima3686@gmail.com',phone:'+91 70911 40333',phoneHref:'tel:+917091140333',
  tagline:'Good ideas rarely move in straight lines.',
  brandLine:'Tangent thinking. Perpendicular commitment.',
  snapshot:'November 2026' // project statuses and dated figures are a snapshot from this record
};

// Status is a dated snapshot, not a live claim. 'Not recorded' shows no status label.
export const STATUSES=['Delivered','Ongoing','Pending','Not recorded'];

export const SECTORS={hospitality:'Hospitality',beauty:'Beauty & wellness',sports:'Sports',personal:'Personal branding',technology:'Technology & products',property:'Property',jewellery:'Jewellery',consumer:'Consumer brands'};

// The four portfolio chapters. The explanation sits directly under each chapter title.
export const CHAPTERS={
 results:{name:'HOT Results',path:'/hot-results',
  explain:'HOT is short for House of Tangents. This is where we show what happened after the work went out.',
  support:'We connect the response to the decisions behind it, with the channel and reporting period beside the number wherever they’re available.'},
 media:{name:'HOT Media',path:'/hot-media',
  explain:'HOT Media is the work you can watch, browse or hold, made by the team at House of Tangents.',
  support:'Explore the films and websites alongside the brand material that carries an idea into everyday use.'},
 identities:{name:'Brand identities',path:'/brand-identities',
  explain:'A brand needs to work wherever people meet it.',
  support:'We develop the identity and carry it into the applications a business actually needs, from packaging to a menu at the table.'},
 tangent:{name:'Tangent Media',path:'/tangent-media',
  explain:'Tangent Media is where we show the turn in the thinking and how we made it happen.',
  support:'Some ideas have already been produced. Others are ready to develop. Every story makes that distinction clear.'}
};

export const TEAM=[
 {id:'farha-fatima',name:'Farha Fatima',role:'Founder, Brand & Creative Director',
  bio:'Farha leads client conversations and creative direction, staying involved in shoots and design as well as campaign delivery. Her background in technology consulting and sales helps her connect the creative work with what the business is trying to achieve.'},
 {id:'tanushree',name:'Tanushree',role:'Marketing & Communications Director',
  bio:'Tanushree works across performance marketing and brand communication. She helps shape the message and stays involved as it moves into campaign execution. She also works with Farha on graphic design and advertising.'},
 {id:'ashish-sahu',name:'Ashish Sahu',role:'Film & Production Director',
  bio:'Ashish works from shoot preparation through the final cut. He helps decide what the team needs to capture, then shapes the footage through selection and editing, with attention to sound and pacing.'},
 {id:'rahul-kumar',name:'Rahul Kumar',role:'Digital Experience Director',
  bio:'Rahul builds websites and helps work out how people will use them. He also contributes research and shoot preparation, and joins the team on set. His work connects the material behind an idea with the experience people encounter online.'}
];

// examples: a project slug, or {slug, hash, label} for a part of a project (Aura sits inside Capitol Hill).
export const SERVICES=[
 {id:'brand',title:'Brand strategy and identity',
  one:'We give the business an introduction it can keep building on.',
  body:'We work on positioning and naming, alongside the identity and the language around it. We then consider how that identity needs to work in the places people will actually meet the brand.',
  when:'When the business is getting its first public identity, or an established one is preparing a new brand for a different market.',
  scope:['Positioning','Naming','Logos','Guidelines','Messaging','Visual direction','Packaging','Menus','Merchandise','Launch applications'],
  examples:['majestic-india','shafaf','moksh','kalinga','lobby-cafe',{slug:'capitol-hill',hash:'aura',label:'Aura'}],
  cta:'Talk to us about your brand'},
 {id:'content',title:'Content and production',
  one:'We choose the production method that serves the idea.',
  body:'Some briefs need a shoot. Others need a careful edit or an imagined scene that can’t yet be filmed. We work through the concept and production details so the final piece does its job.',
  when:'When there’s footage to shoot or shape, or a place that can’t be filmed yet.',
  scope:['Research','Scripts','Shoot planning','Filming','Photography','Remote production briefing','AI visualisation','Editing','Colour','Sound and subtitles'],
  scopeNote:'According to the engagement.',
  examples:['navdurga','santhal-strikers','saregama','zoha'],
  cta:'Discuss a production brief'},
 {id:'marketing',title:'Marketing and campaigns',
  one:'We connect what the brand says with a reason to respond.',
  body:'We plan campaigns and everyday communication around the audience and the business need. Launches and event promotion sit alongside the consistent work of publishing, reviewing the response and improving what comes next.',
  when:'When the business has something to say and people need a reason to respond, from a launch to the everyday rhythm of publishing.',
  scope:['Social strategy','Account management','Campaigns','Launches','Paid Meta campaigns','Google Business Profile','Creator coordination','Audience communication'],
  examples:['capitol-hill','black','zoi','majestic-india','shambhavi'],
  cta:'Plan your next campaign'},
 {id:'digital',title:'Websites and digital journeys',
  one:'A click should lead somewhere that makes sense.',
  body:'We build websites and e-commerce experiences, then work through what happens after someone arrives. Forms and onboarding need attention too, along with the messages that continue the conversation.',
  when:'When people are arriving, or about to, and the next step after the click needs thought.',
  scope:['Websites','Shopify','Landing pages','Forms','User journeys','Product communication','Email flows','Automations','Developer coordination'],
  examples:['grenx','fluffypet','bioecko','quzones','ifitme','the-pi','unfaked'],
  cta:'Discuss your digital experience'}
];

export const MEDIA_TYPES={films:'Films and edits',ai:'AI visualisation',creative:'Campaign creative',websites:'Websites',print:'Print and merchandise',applications:'Brand applications'};

export const VIDEO_INFO={
 '1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R':{title:'Majestic India logo reveal',summary:'The reveal was filmed with blank paper before the final logo was ready. The completed identity was added through masking in post-production.'},
 '1mCBaiNOb5DHhRrg9fdJOhkGoj9FB1kx5':{title:'Majestic India coronation ceremony',summary:'Content from the coronation ceremony, part of the coronation communication work.'},
 '1IzD6S150dlt_67egDONjNg_xl_X2vFXA':{title:'Santhal Strikers film',summary:'Content from the Santhal Strikers campaign during the June 2026 JT20 tournament.'},
 '1AyOQKV71B_XW0_66Gw23rU0tnyqK_nO4':{title:'Sundowner at ZOI, final cut',summary:'Final cut of the film for the Sundowner event at ZOI.'},
 '1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ':{title:'Navdurga: airport-to-site journey',summary:'An AI-generated journey from arrival towards the planned Navdurga Business Park. The visuals present a proposed development, not filmed footage of completed construction.'},
 '1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c':{title:'Navdurga: FPV-style facilities walkthrough',summary:'A fully AI-generated FPV-style walkthrough of the planned park, showing cranes, internal roads, weighbridges, warehouses and loading trucks. The visuals present proposed facilities, not filmed footage of completed construction.'},
 '1bAqfGtzcOb1o2VfosDDsd1CPl0Wd-guR':{title:'Zoha Jewellery festive campaign film',summary:'Campaign film for the Dhanteras and Diwali 2026 jewellery campaign.'},
 '1ixHYwLdHRfK_QZlWKXqw_Wl0-nNvo67H':{title:'Dense film',summary:'An edit for Dense. Local photographers and videographers shot the food to our remote briefs.'}
};

// Videos hosted on this site (optimised copies of the client's files). Others play from Drive only after a click.
export const LOCAL_VIDEOS={
 '1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R':{src:'/assets/media/majestic-india/logo-reveal.mp4',poster:'majestic-india/still-reveal',w:720,h:1280},
 '1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ':{src:'/assets/media/navdurga/airport-to-site.mp4',poster:'navdurga/still-gate',w:720,h:1280},
 '1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c':{src:'/assets/media/navdurga/fpv-walkthrough.mp4',poster:'navdurga/still-aerial',w:720,h:1280}
};
