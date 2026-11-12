// Shared, verified site facts. Do not add details that are not in the client source.
export const SITE={
  name:'House of Tangents',url:'https://house-of-tangents.vercel.app',
  email:'farhafatima3686@gmail.com',phone:'+91 70911 40333',phoneHref:'tel:+917091140333',
  tagline:'Tangent thinking. Perpendicular commitment.',
  asOf:'11 November 2026'
};
export const STATUSES=['Delivered','Ongoing','Proposed','Unpublished / under review','Status to confirm'];
export const CATEGORIES={branding:'Branding and identity',campaigns:'Campaigns and marketing',film:'Film and content',digital:'Websites and digital',hospitality:'Hospitality',product:'Product and technology'};
export const TEAM=[
 {name:'Farha Fatima',role:'Founder, Brand & Creative Director',short:'Leads client conversations and pitches, sets the creative direction and oversees delivery, with a background in technology consulting and sales.',
  bio:['Farha’s background in technology consulting and sales shapes how she approaches a marketing brief. She leads client conversations and pitches. She also sets the creative direction and oversees delivery, while staying involved in shoots and graphic design. She works on campaigns too.','Her earlier leadership experience includes a 12-person team managing 11 client accounts at the same time.']},
 {name:'Tanushree',role:'Marketing & Communications Director',short:'Works across performance marketing and brand communication, turning a campaign idea into communication that makes sense to its audience.',
  bio:['Tanushree works across performance marketing and brand communication. She helps turn a campaign idea into communication that makes sense to its audience, then stays involved in everyday execution.','She and Farha work together on graphic design and advertising, keeping the message consistent as it moves from a creative into a client or customer conversation.']},
 {name:'Ashish Sahu',role:'Film & Production Director',short:'Works on shoots and follows the footage through post-production, from selection and pacing to sound and the final cut.',
  bio:['Ashish works on shoots and follows the footage through post-production. He helps decide what we need to capture, then works on selection, pacing, sound and editing.','That can mean building energy into a campaign film or giving a quieter moment enough room. His involvement runs from the set to the final cut.']},
 {name:'Rahul Kumar',role:'Digital Experience Director',short:'Builds websites and works out how people will use them, and joins research, shoot preparation and the team on set.',
  bio:['Rahul builds websites and helps work out how people will use them. He also contributes research and shoot preparation, and joins the team on set.','He helps gather the material a concept needs, then works with the team to turn the communication into a digital experience people can find their way through.']}
];
export const SERVICES=[
 {id:'brand',title:'Brand strategy and identity',short:'We work on positioning, naming, logos, guidelines and messaging. The aim is an introduction the business can use consistently as it grows.',
  long:['We work on positioning and naming, as well as logos, guidelines, messaging and visual direction. The aim is to give the business an introduction it can use consistently as it grows.','Identity work extends into the places a brand will appear, including menus, packaging, merchandise and launch material.'],
  proof:['majestic-india','kalinga','shafaf','moksh']},
 {id:'content',title:'Content and production',short:'Research, concepts, scripts, shoots, AI visualisation, editing and publishing. We choose the method that suits the brief and the material available.',
  long:['Our work covers research, concepts, scripts, shoots, AI visualisation, editing and publishing. We choose a production method because it suits the brief and the material available.'],proof:['santhal-strikers','navdurga','saregama','zoha']},
 {id:'marketing',title:'Marketing and campaigns',short:'Social media and launches, with event promotion, paid advertising, creator collaborations and audience communication, according to the engagement.',
  long:['We handle social media and launches, with event promotion, paid advertising, creator collaborations and audience communication according to the engagement.'],proof:['capitol-hill','black','zoi','shambhavi']},
 {id:'digital',title:'Websites and digital journeys',short:'Websites and e-commerce, plus product communication, forms, onboarding, email flows and automation, so the next step after a click has some thought behind it.',
  long:['We build websites and e-commerce experiences. We also work on product communication, forms, onboarding, email flows and automation, so the next step after a click has some thought behind it.'],proof:['grenx','fluffypet','bioecko','quzones']}
];
export const VIDEO_INFO={
 '1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R':{title:'Majestic India logo reveal',summary:'The reveal was filmed with blank paper before the final logo was ready. The completed identity was added through masking in post-production.'},
 '1mCBaiNOb5DHhRrg9fdJOhkGoj9FB1kx5':{title:'Majestic India coronation ceremony',summary:'Content from the coronation ceremony, part of the coronation communication work.'},
 '1IzD6S150dlt_67egDONjNg_xl_X2vFXA':{title:'Santhal Strikers',summary:'Content from the Santhal Strikers JT20 campaign, June 2026.'},
 '1AyOQKV71B_XW0_66Gw23rU0tnyqK_nO4':{title:'Sundowner at ZOI, final cut',summary:'Final cut of the film for the Sundowner event at ZOI.'},
 '1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ':{title:'Navdurga: airport-to-site journey',summary:'An AI-generated journey from the airport towards the planned Navdurga Business Park, introducing nearby connections along the way. The visuals present a proposed development, not filmed footage of completed construction.'},
 '1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c':{title:'Navdurga: FPV-style facilities walkthrough',summary:'A fully AI-generated FPV drone-style walkthrough of the planned park, showing cranes, roads, weighbridges, warehouses and loading trucks. The visuals present proposed facilities, not filmed footage of completed construction.'},
 '1bAqfGtzcOb1o2VfosDDsd1CPl0Wd-guR':{title:'Zoha Jewellery festive campaign film',summary:'Campaign film for the Dhanteras and Diwali 2026 jewellery campaign.'},
 '1ixHYwLdHRfK_QZlWKXqw_Wl0-nNvo67H':{title:'Dense film',summary:'Video content for Dense, the sandwich brand, from the 19 September edit.'}
};

// Videos hosted on this site (optimised copies of the client's files). Others still play from Drive on request.
export const LOCAL_VIDEOS={
 '1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R':{src:'/assets/media/majestic-india/logo-reveal.mp4',poster:'majestic-india/still-reveal',w:720,h:1280},
 '1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ':{src:'/assets/media/navdurga/airport-to-site.mp4',poster:'navdurga/still-gate',w:720,h:1280},
 '1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c':{src:'/assets/media/navdurga/fpv-walkthrough.mp4',poster:'navdurga/still-aerial',w:720,h:1280}
};
