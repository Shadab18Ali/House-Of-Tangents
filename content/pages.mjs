// Page-level content. Every claim here traces to the client's project records. Keep each figure tied to its project.

// The film reference. The dialogue is the excerpt the client supplied; it is not rewritten here.
export const WASSEYPUR={
 dialogue:'“अगर जान से मरा, तो ब्लेड परपेंडीकुलर गया था…और अगर सिर्फ चमड़ी कटा, तो समझो टेंजेण्ट था.”',
 cite:'Guddu, Gangs of Wasseypur Part II',
 heading:'The angle matters. So does what you do with it.',
 body:'The tangent and perpendicular reference in Gangs of Wasseypur stayed with us. At House of Tangents, we’ve given that thought a different job. We look beyond the first familiar answer, then stay involved until the idea becomes work people can actually encounter.',
 closing:'Tangent thinking. Perpendicular commitment.'
};

export const HOME={
 // Four separate project results. They are never added together.
 results:[
  {slug:'capitol-hill',claim:'800%+ organic reach growth.',label:'Within the first two months.',did:'We brought consistent content and regular Google Business Profile updates to a 22-year-old hotel and its outlets.'},
  {slug:'majestic-india',claim:'Approximately 300 qualified enquiries.',label:'Contestant lead campaigns over approximately three to five months.',did:'We built the identity, the website and the accounts, then ran the contestant lead campaigns.'},
  {slug:'black',claim:'Five to ten bookings a day, reported around ‘Black turns 2’.',label:'The anniversary campaign used no Google or Meta ad spend.',did:'We planned two to three weeks of anniversary communication around a 20% service offer.'},
  {slug:'santhal-strikers',claim:'832 followers in 20 days.',label:'No paid follower acquisition.',did:'We created the current team’s branding and new accounts with roughly two days to prepare, then covered the tournament on site.'}
 ],
 strip:[
  {slug:'shambhavi',line:'Two videos above one million views, organically.'},
  {slug:'zoi',line:'Approximately five to ten enquiries a day, as reported by the team.'},
  {slug:'sanatni',line:'Approximately 900 app downloads across campaign and launch work.'},
  {slug:'the-pi',line:'Approximately 300 app downloads from a campus activation at XISS.'},
  {slug:'dimechain',line:'A LinkedIn page grown from zero to 584 followers in about three to three-and-a-half months.'}
 ],
 media:['navdurga-journey','majestic-reveal','saregama-bts','santhal-film','zoha-film','grenx-shopify']
};

// HOT Media archive. `video` is a key in VIDEO_INFO, `image` a creative in content/media.json.
// Items with neither render as a typographic entry: nothing is fabricated to fill the gap.
export const MEDIA_ITEMS=[
 {id:'navdurga-journey',project:'navdurga',type:'ai',title:'Airport-to-site journey',video:'1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ',
  did:'Concept, scene planning, prompts, AI generation, voiceover, sound and editing. The scenes show a proposed development, not completed construction.',home:'AI-generated site-visit films.'},
 {id:'majestic-reveal',project:'majestic-india',type:'films',title:'Logo reveal film',video:'1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R',
  did:'We filmed the blank-paper interaction before the logo was final, then added the finished identity through masking in post-production.',home:'The logo reveal and Women’s Day work.'},
 {id:'navdurga-fpv',project:'navdurga',type:'ai',title:'FPV-style facilities walkthrough',video:'1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c',
  did:'A fully AI-generated walkthrough of the proposed facilities, from cranes and weighbridges to warehouses and loading trucks.'},
 {id:'majestic-sita-poster',project:'majestic-india',type:'creative',title:'Sita: social creative',image:'majestic-india/creative-sita-poster',did:'Graphic design for Majestic India’s social content.'},
 {id:'majestic-naina-collage',project:'majestic-india',type:'creative',title:'Naina: collage creative',image:'majestic-india/creative-naina-collage',did:'Graphic design for Majestic India’s social content.'},
 {id:'navdurga-map',project:'navdurga',type:'creative',title:'Connectivity map creative',image:'navdurga/creative-connectivity-map',did:'Social creative published as part of the page management for Navdurga Business Park.'},
 {id:'majestic-sita-collage',project:'majestic-india',type:'creative',title:'Sita: collage creative',image:'majestic-india/creative-sita-collage',did:'Graphic design for Majestic India’s social content.'},
 {id:'majestic-naina-poster',project:'majestic-india',type:'creative',title:'Naina: Tribal Look creative',image:'majestic-india/creative-naina-poster',did:'Graphic design for Majestic India’s social content.'},
 {id:'santhal-film',project:'santhal-strikers',type:'films',title:'Santhal Strikers film',video:'1IzD6S150dlt_67egDONjNg_xl_X2vFXA',
  did:'Player shoots, on-site coverage and editing during the June 2026 tournament.',home:'Player stories and introductions.'},
 {id:'zoha-film',project:'zoha',type:'creative',title:'Festive campaign film',video:'1bAqfGtzcOb1o2VfosDDsd1CPl0Wd-guR',
  did:'Photographer-led jewellery shoots, editing and design for the Dhanteras and Diwali campaign.',home:'Festive campaign photography and creative.'},
 {id:'majestic-sita-photo',project:'majestic-india',type:'creative',title:'Sita: photograph',image:'majestic-india/creative-sita-photo',did:'Photograph from the shoot behind the Majestic India creatives.'},
 {id:'majestic-naina-photo',project:'majestic-india',type:'creative',title:'Naina: photograph',image:'majestic-india/creative-naina-photo',did:'Photograph from the shoot behind the Majestic India creatives.'},
 {id:'zoi-sundowner',project:'zoi',type:'films',title:'Sundowner, final cut',video:'1AyOQKV71B_XW0_66Gw23rU0tnyqK_nO4',did:'Concept, promotion, coverage and the edit for the Sundowner event.'},
 {id:'majestic-coronation',project:'majestic-india',type:'films',title:'Coronation ceremony',video:'1mCBaiNOb5DHhRrg9fdJOhkGoj9FB1kx5',did:'Content from the coronation, part of the coronation communication we handled.'},
 {id:'majestic-sita-full',project:'majestic-india',type:'creative',title:'Sita: photograph',image:'majestic-india/creative-sita-full',did:'Photograph from the shoot behind the Majestic India creatives.'},
 {id:'majestic-naina-street',project:'majestic-india',type:'creative',title:'Naina: photograph',image:'majestic-india/creative-naina-street',did:'Photograph from the shoot behind the Majestic India creatives.'},
 {id:'dense-film',project:'dense',type:'films',title:'Dense edit',video:'1ixHYwLdHRfK_QZlWKXqw_Wl0-nNvo67H',did:'Editing and remote production direction. Local photographers and videographers shot the food to our briefs.'},
 {id:'majestic-naina-detail',project:'majestic-india',type:'creative',title:'Naina: jewellery detail',image:'majestic-india/creative-naina-detail',did:'Photograph from the shoot behind the Majestic India creatives.'},
 // No asset supplied yet: typographic entries.
 {id:'saregama-bts',project:'saregama',type:'films',title:'Maavdi BTS film',
  did:'Footage selection, editing, colour, sound and subtitles, using footage supplied by the shooting team.',
  note:'Approval and publication pending in the November 2026 record. The film isn’t shown here.',home:'The Maavdi BTS post-production project.'},
 {id:'majestic-lifestages',project:'majestic-india',type:'ai',title:'Life-stages transformation film',did:'An AI face-morphing film that moves between women at different stages of life. The sequence used AI-generated imagery.'},
 {id:'majestic-womensday',project:'majestic-india',type:'creative',title:'Women’s Day shoot',did:'A published shoot about making participation feel possible across different life stages.'},
 {id:'black-content',project:'black',type:'creative',title:'Daily transformation content',did:'Hair transformations and client testimonials, published every day.'},
 {id:'grenx-shopify',project:'grenx',type:'websites',title:'Shopify website',did:'A Shopify website, with QR-led exhibition creative, segmented entry forms and email automation behind it.',home:'Shopify and exhibition communication.'},
 {id:'black-site',project:'black',type:'websites',title:'Salon website',did:'A website for the salon, alongside daily Google posts.'},
 {id:'majestic-site',project:'majestic-india',type:'websites',title:'Platform website',did:'A website for the pageant platform, built alongside the launch.'},
 {id:'kalinga-site',project:'kalinga',type:'websites',title:'Restaurant website',did:'A website for the restaurant, within the shared AVN Grand engagement.'},
 {id:'bioecko-site',project:'bioecko',type:'websites',title:'BioEcko website',did:'Structure and copy explaining the organisation, its approach and the people behind it.'},
 {id:'fluffypet-site',project:'fluffypet',type:'websites',title:'FluffyPet website',did:'Website and onboarding communication for service providers.'},
 {id:'quzones-site',project:'quzones',type:'websites',title:'QuZones website',did:'Website and use-case communication for quantum and AI propositions.'},
 {id:'ifitme-site',project:'ifitme',type:'websites',title:'i-Fit.Me website',did:'Website and feature explanation for a healthcare and wellness product.'},
 {id:'pi-site',project:'the-pi',type:'websites',title:'The Pi website',did:'Website and social presence for the app launch.'},
 {id:'unfaked-site',project:'unfaked',type:'websites',title:'Unfaked website',did:'Website and introductory communication for a deepfake-detection proposition.'},
 {id:'pi-merch',project:'the-pi',type:'print',title:'Launch merchandise',did:'Designs for cups, mouse pads and desk accessories, diaries, shirts, T-shirts and giveaway packaging.'},
 {id:'fluffypet-print',project:'fluffypet',type:'print',title:'Collars, packaging and camp material',did:'Reflective collars and packaging applications, with posters and standees for the adoption camp.'},
 {id:'sanatni-launch',project:'sanatni',type:'print',title:'Launch assets and merchandise',did:'Promotional assets, posters, signage and merchandise design for the Ayodhya launch.'},
 {id:'santhal-print',project:'santhal-strikers',type:'print',title:'Print and stadium assets',did:'Print and stadium assets for the team during the tournament.'},
 {id:'grenx-exhibition',project:'grenx',type:'print',title:'Exhibition material',did:'QR posters, standees and design elements for the exhibition giveaway.'},
 {id:'kalinga-menu',project:'kalinga',type:'applications',title:'Logo and full menu',did:'Original logo and full menu design.'},
 {id:'lobby-menu',project:'lobby-cafe',type:'applications',title:'Logo and menu',did:'Original logo and menu design for the café.'},
 {id:'sparrow-menu',project:'moksh',type:'applications',title:'Sparrow service menu',did:'The salon’s identity carried into its service menu.',link:'/work/moksh#sparrow'},
 {id:'shafaf-pack',project:'shafaf',type:'applications',title:'Broom packaging',did:'Packaging applications for phool and kaanti brooms. The printed rollout follows approved artwork.'},
 {id:'aura-launch',project:'capitol-hill',type:'applications',title:'Aura launch communication',did:'Rooftop identity and launch communication within the hotel group.',link:'/work/capitol-hill#aura'}
];

// Brand identities. `logo` is a key in content/assets.json logos; `explored` separates design routes from approved work.
export const IDENTITIES=[
 {logo:'majestic-india',name:'Majestic India',kind:'Pageant platform',href:'/work/majestic-india',image:'majestic-india/creative-sita-collage',
  scope:'Original identity and guidelines, with the reveal that introduced them.',apps:'Website, social accounts, sponsorship decks, coronation and event assets.',
  explored:'Approximately ten logo routes were explored before the final identity.'},
 {logo:'kalinga',name:'Kalinga India',kind:'Restaurant',href:'/work/kalinga',scope:'Original logo.',apps:'Full menu, website and social content.'},
 {logo:'lobby-cafe',name:'The Lobby Café',kind:'Café',href:'/work/lobby-cafe',scope:'Original logo.',apps:'Menu, website and social communication.'},
 {logo:'aura',name:'Aura',kind:'Rooftop at Capitol Hill',href:'/work/capitol-hill#aura',scope:'Original rooftop identity.',apps:'Launch communication within the hotel group.'},
 {logo:'sanatni',name:'Sanatni',kind:'Spiritual platform',href:'/work/sanatni',scope:'Naming, logo, guidelines, visual language and messaging.',apps:'Website, app journeys, launch assets, signage and merchandise design.'},
 {logo:'the-pi',name:'The Pi',kind:'App launch',href:'/work/the-pi',scope:'Original logo and identity.',apps:'Website, launch material and designs for cups, desk accessories, diaries, shirts and giveaway packaging.',
  note:'The merchandise credit is for design, not manufacturing.'},
 {logo:'fluffypet',name:'FluffyPet',kind:'Pet services app',href:'/work/fluffypet',scope:'Logo, with original and refreshed guidelines.',apps:'Website, onboarding emails, reflective collars, packaging applications, posters and standees.'},
 {logo:'bioecko',name:'BioEcko',kind:'Healthtech',href:'/work/bioecko',scope:'Logo and guidelines.',apps:'Website and LinkedIn communication.'},
 {logo:'dimechain',name:'Dimechain',kind:'Technology',href:'/work/dimechain',scope:'Identity and guidelines.',apps:'Presentations and the LinkedIn page.'},
 {logo:'shafaf',name:'Shafaf',kind:'Broom brand',href:'/work/shafaf',scope:'Logo, guidelines and brand direction for a new brand. The underlying business was established in 1960.',apps:'Packaging for phool and kaanti brooms.',
  explored:'Colour directions explored blue and red, along with yellow and green. The printed rollout follows approved artwork, not every route we explored.'},
 {logo:'moksh',name:'Moksh',kind:'Parent property, Dhanbad',href:'/work/moksh',scope:'Logo and brand guidelines for the parent property.',apps:'The foundation for the three venue identities below.',note:'The property is upcoming.'},
 {logo:'sora',name:'Sora',kind:'Pool-table café at Moksh',href:'/work/moksh#sora',scope:'Logo and guidelines.',apps:'Kept distinct from the rooftop venue.'},
 {logo:'solace',name:'Solace',kind:'Rooftop venue at Moksh',href:'/work/moksh#solace',scope:'Logo and guidelines.',apps:'Its own identity within the property, ahead of launch.'},
 {logo:'sparrow',name:'Sparrow',kind:'Hair salon at Moksh',href:'/work/moksh#sparrow',scope:'Logo and guidelines.',apps:'Service menu.'}
];

// HOT Results. A string is a project slug; an object is a combined story.
export const RESULT_GROUPS=[
 {id:'hospitality',title:'Hospitality and discovery',items:['capitol-hill','zoi',
  {id:'avn-group',title:'Hotel AVN Grand, Kalinga India and The Lobby Café',links:['avn-grand','kalinga','lobby-cafe'],
   start:'An established hotel with business bookings needed its dining and café offerings to be found. Kalinga India opened in August 2025 and The Lobby Café in 2026.',
   decision:'Let the food and the people behind it lead, and give each venue its own introduction while keeping the link to the hotel clear.',
   delivered:'Social communication, shoots and editing, websites, Google presence and separate Meta campaigns, with original logos and menus for Kalinga India and The Lobby Café.',
   response:['Visibility and walk-in improvement were reported, without confirmed totals.','Kalinga India’s Valentine’s Day activity received strong bookings. No numerical booking data was supplied.'],
   note:'These outcomes are qualitative. We haven’t converted them into numbers.'}]},
 {id:'beauty',title:'Beauty and appointment enquiries',items:['black']},
 {id:'pageants',title:'Pageants and personal branding',items:['majestic-india','shambhavi']},
 {id:'sports',title:'Sports and audience building',items:['santhal-strikers']},
 {id:'products',title:'Product introductions and professional audiences',items:['sanatni','the-pi','dimechain','grenx']}
];

// Tangent Media: delivered stories. `video` keys into VIDEO_INFO. Nothing here is a proposal.
export const STORIES=[
 {id:'navdurga',slug:'navdurga',title:'The park wasn’t built. We planned the visit.',
  brief:'Show a planned business park, in a way that felt more interesting than familiar business-park promotion.',
  block:'There was no completed site to film. A list of distances and facilities would have asked viewers to imagine the experience themselves.',
  turn:'We imagined the first visit instead: arriving, then travelling towards the location.',
  made:'We planned the scenes and wrote the prompts, generated the sequences, then brought them together with voiceover, sound and editing.',
  result:'Two films, published organically on the page we managed: the journey towards the site and a separate FPV-style walkthrough of the proposed facilities.',
  label:'Proposed infrastructure visualisation. These are AI-generated scenes, not footage of completed construction.',
  videos:['1O8yoclSPpoSUFJ63_Y8RsHPvDSQzXQKQ','1bCogJk3ULAUqbocAFMmUHo5CwBDeLa9c']},
 {id:'majestic-india',slug:'majestic-india',title:'The shoot couldn’t wait for the logo.',
  brief:'Reveal the identity of a new pageant platform.',
  block:'The logo was still in development, and the shoot couldn’t wait for the final artwork.',
  turn:'We filmed the performance and the blank-paper interaction first.',
  made:'Once the logo was complete, we used masking to place the finished identity into the footage.',
  result:'Production carried on while the design work was still underway. The reveal campaign was completed and published.',
  videos:['1uhfVZn8W7AayoNY6HOi3Amw1ol7GJl_R']},
 {id:'santhal-strikers',slug:'santhal-strikers',title:'Before the player introduction, we listened.',
  brief:'Introduce the players of a team whose new account had roughly two days to get ready before the tournament.',
  block:'A name and a match result don’t give people much reason to care about a player.',
  turn:'A conversation with Pratyush Kumar about his village background and his cricket ambition became the basis for a player film.',
  made:'The film opened with the familiar question about what a child wants to become, then followed that thought from a small ground and a tennis ball to the ambition of playing cricket.',
  result:'The story ran alongside other player introductions during the tournament. The case study has the reported response.'},
 {id:'black',slug:'black',title:'The decision was to keep showing the work.',
  brief:'Help people choose a salon, which means trusting someone with how you’ll look when you leave.',
  block:'People couldn’t judge the quality of the work before they booked.',
  turn:'We kept it simple. Regular transformations and client testimonials gave people the evidence they needed, so the thinking was in choosing what to repeat.',
  made:'Hair transformations and testimonials went out every day, sometimes twice a day, with stories from inside the salon and daily Google posts.',
  result:'Creative judgement includes knowing when consistency is the useful answer. The engagement was ongoing in the November 2026 record.'},
 {id:'saregama',slug:'saregama',title:'Everyone in the room needed to be in the film.',
  brief:'Edit a behind-the-scenes film for “Maavdi” from footage supplied by the shooting team.',
  block:'The requirement was that everyone involved in the room had to appear, including the lighting and sound crews whose contributions are easier to miss.',
  turn:'We let the people and the footage carry the edit. Constant cuts or motion graphics would have pulled attention away from them.',
  made:'Inclusive footage selection, then editing, colour, sound and subtitles, with no motion graphics.',
  result:'Post-production is complete, and the shooting team gave outstanding feedback. Management approval and publication were pending in the November 2026 record, so the film isn’t shown here.'}
];

// Tangent Media: proposed formats. Never shown as delivered or commissioned work.
export const IDEAS=[
 {title:'The Brief Took a Turn',what:'A proposed short-form series showing a brief, the change in approach and the resulting work.',
  footage:'Approved samples of finished work, starting with Navdurga. Later episodes could use Majestic India’s reveal, Pratyush’s story and Black.',
  approach:'A short edit that puts the original brief on screen with the assumption that limited it, then the alternative question and the finished work.',
  placement:'Short-form video on House of Tangents’ own channels.'},
 {title:'Angle / Execution',what:'A proposed format pairing an observation with a practical production plan.',
  footage:'No new footage. Each entry needs the observation, the scene and the assets it would use.',
  approach:'The observation sits beside the production method, the assets and the audience response we’d want to encourage.',
  placement:'A carousel or website format. The same structure could sit inside our proposals.'}
];

export const PROCESS=[
 {title:'Understand what needs to change.',text:'We look at what the business needs and who it wants to reach, then assess the material already available.'},
 {title:'Find a useful direction.',text:'That tells us whether the next step is an identity or a story, a digital journey or a steadier content rhythm.'},
 {title:'Make and deliver the work.',text:'We plan production and build the assets, then publish or hand over the work.'},
 {title:'Review the response and improve.',text:'We review the response available to us. Feedback informs the next version, whether that’s a script or the product experience itself.'}
];

// Smaller engagements. Limited scope, stated plainly.
export const ADDITIONAL=[
 {name:'Cyclist Café',scope:'A pet-friendly café script and collaboration planning.'},
 {name:'Street Dogs of Ranchi',scope:'The FluffyPet adoption-camp collaboration.'},
 {name:'Shaadi Essentials',scope:'Gifting communication, a deck, and proposal and copy development.'},
 {name:'ABS College and Shri Anandam Dham',scope:'An earlier website-work record.'},
 {name:'Chai Bubble',scope:'An earlier hospitality engagement record.'},
 {name:'Pi Studio and Brand Thinker',scope:'Earlier agency experience, where members of the team worked before House of Tangents.'}
];

export const NOTES={
 collective:'This site presents selected collective team experience across client work, product engagements and earlier agency roles. Contributions and scope vary by project.',
 results:'Project results come from team records, supplied case studies and client-reported feedback. Reporting periods are stated where available. Historical results are not guarantees of future performance.',
 collaborators:'Our core team has four people. Specialist collaborators join according to the project.'
};
