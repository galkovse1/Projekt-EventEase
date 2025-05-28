const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const Event = require('./models/Event');
const EventVisibility = require('./models/EventVisibility');

async function seedEvents() {
  try {
    await sequelize.authenticate();
    console.log('✅ Povezava z bazo uspešna.');

    const events = [
  {
    "id": "2635461e-7985-4ceb-a42a-ead498faed1d",
    "title": "Glasbeni ve\u010der",
    "description": "Opis dogodka Glasbeni ve\u010der",
    "dateTime": "2025-06-04T12:51:45.733092",
    "location": "Maribor",
    "imageUrl": "https://picsum.photos/seed/0/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user14",
    "maxSignups": null,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user4",
      "auth0|user1"
    ]
  },
  {
    "id": "fbaa5dfe-7255-4b99-a8f4-fddc24974eaf",
    "title": "Programerski meetup",
    "description": "Opis dogodka Programerski meetup",
    "dateTime": "2025-06-17T12:51:45.733328",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/1/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user20",
    "maxSignups": null,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user13",
      "auth0|user8"
    ]
  },
  {
    "id": "f65e1a25-6499-43f5-854c-a2a791e5e444",
    "title": "Jutranja joga",
    "description": "Opis dogodka Jutranja joga",
    "dateTime": "2025-06-25T12:51:45.733599",
    "location": "Velenje",
    "imageUrl": "https://picsum.photos/seed/2/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user12",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "17c80b80-c651-48b7-8cb2-fd0c70f227ff",
    "title": "Umetni\u0161ka razstava",
    "description": "Opis dogodka Umetni\u0161ka razstava",
    "dateTime": "2025-06-15T12:51:45.733836",
    "location": "Novo mesto",
    "imageUrl": "https://picsum.photos/seed/3/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user8",
    "maxSignups": 20,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user2"
    ]
  },
  {
    "id": "6954f2a3-9af4-411c-80aa-8b43ec7c7a08",
    "title": "Te\u010daj kuhanja",
    "description": "Opis dogodka Te\u010daj kuhanja",
    "dateTime": "2025-07-25T12:51:45.734091",
    "location": "Ljubljana",
    "imageUrl": "https://picsum.photos/seed/4/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user17",
    "maxSignups": null,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "0c84d9d8-6070-4972-8049-7f8af2eb35d1",
    "title": "Startup delavnica",
    "description": "Opis dogodka Startup delavnica",
    "dateTime": "2025-07-08T12:51:45.734233",
    "location": "Ptuj",
    "imageUrl": "https://picsum.photos/seed/5/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user11",
    "maxSignups": 20,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user2",
      "auth0|user1",
      "auth0|user19",
      "auth0|user15"
    ]
  },
  {
    "id": "938412ea-7085-4abb-b0ba-766cb75e7802",
    "title": "Pohod na Pohorje",
    "description": "Opis dogodka Pohod na Pohorje",
    "dateTime": "2025-07-04T12:51:45.734533",
    "location": "Novo mesto",
    "imageUrl": "https://picsum.photos/seed/6/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user18",
    "maxSignups": null,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "1d2e55a2-de48-4b94-956a-ee27334cc7ab",
    "title": "Filmski ve\u010der",
    "description": "Opis dogodka Filmski ve\u010der",
    "dateTime": "2025-07-16T12:51:45.734693",
    "location": "Ptuj",
    "imageUrl": "https://picsum.photos/seed/7/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user18",
    "maxSignups": null,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user18",
      "auth0|user9"
    ]
  },
  {
    "id": "c0da0176-d206-4dc7-a50c-367579f8456d",
    "title": "Predavanje o varnosti",
    "description": "Opis dogodka Predavanje o varnosti",
    "dateTime": "2025-06-27T12:51:45.735007",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/8/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user3",
    "maxSignups": 50,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "ae7e201b-3c70-472e-b136-bf2872841c3b",
    "title": "Ustvarjalna delavnica",
    "description": "Opis dogodka Ustvarjalna delavnica",
    "dateTime": "2025-07-02T12:51:45.735288",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/9/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user4",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "6c8e09f8-b338-45a9-935e-44cdbcdb4954",
    "title": "Turnir v \u0161ahu",
    "description": "Opis dogodka Turnir v \u0161ahu",
    "dateTime": "2025-06-21T12:51:45.735365",
    "location": "Novo mesto",
    "imageUrl": "https://picsum.photos/seed/10/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user1",
    "maxSignups": 20,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "c3cc3173-9e8a-420e-8b04-081b18f97b70",
    "title": "Hackathon 2025",
    "description": "Opis dogodka Hackathon 2025",
    "dateTime": "2025-07-13T12:51:45.735749",
    "location": "Maribor",
    "imageUrl": "https://picsum.photos/seed/11/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user8",
    "maxSignups": 50,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "3a3a6603-2047-4eec-b813-95600d96545b",
    "title": "Zdrav \u017eivljenjski slog",
    "description": "Opis dogodka Zdrav \u017eivljenjski slog",
    "dateTime": "2025-06-13T12:51:45.735813",
    "location": "Ptuj",
    "imageUrl": "https://picsum.photos/seed/12/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user18",
    "maxSignups": 20,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user1"
    ]
  },
  {
    "id": "decd69c7-856e-44c9-8678-ce47a0e87b51",
    "title": "Kolesarska tura",
    "description": "Opis dogodka Kolesarska tura",
    "dateTime": "2025-06-25T12:51:45.735852",
    "location": "Ljubljana",
    "imageUrl": "https://picsum.photos/seed/13/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user7",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "99c4c671-f568-4705-9bac-bc86eb7ed1f2",
    "title": "Snemanje podkasta",
    "description": "Opis dogodka Snemanje podkasta",
    "dateTime": "2025-06-18T12:51:45.735887",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/14/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user20",
    "maxSignups": null,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "872f1401-92fd-4707-b15e-cd0f3ffdf9bc",
    "title": "Dru\u017eabni ve\u010der",
    "description": "Opis dogodka Dru\u017eabni ve\u010der",
    "dateTime": "2025-05-29T12:51:45.735921",
    "location": "Ljubljana",
    "imageUrl": "https://picsum.photos/seed/15/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user17",
    "maxSignups": 50,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "2b2aa369-00dc-4bf5-aeb6-14fe57376fe0",
    "title": "Meditacijski vikend",
    "description": "Opis dogodka Meditacijski vikend",
    "dateTime": "2025-07-06T12:51:45.735955",
    "location": "Koper",
    "imageUrl": "https://picsum.photos/seed/16/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user10",
    "maxSignups": 20,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "f48dd60d-4c83-418e-85ca-1940ab0e174c",
    "title": "Tehni\u010dni sejem",
    "description": "Opis dogodka Tehni\u010dni sejem",
    "dateTime": "2025-06-15T12:51:45.735989",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/17/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user2",
    "maxSignups": null,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "c412dad2-86f2-49ab-9745-ff99fa0094a7",
    "title": "Okrogla miza",
    "description": "Opis dogodka Okrogla miza",
    "dateTime": "2025-07-13T12:51:45.736032",
    "location": "Celje",
    "imageUrl": "https://picsum.photos/seed/18/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user11",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "42477008-da21-480f-9534-ffcff0a116ec",
    "title": "Poletna \u0161ola kodiranja",
    "description": "Opis dogodka Poletna \u0161ola kodiranja",
    "dateTime": "2025-06-25T12:51:45.736070",
    "location": "Ljubljana",
    "imageUrl": "https://picsum.photos/seed/19/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user14",
    "maxSignups": 50,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "bc62fd50-202b-44d5-a16a-54fb13f61999",
    "title": "Literarni ve\u010der",
    "description": "Opis dogodka Literarni ve\u010der",
    "dateTime": "2025-05-30T12:51:45.736111",
    "location": "Velenje",
    "imageUrl": "https://picsum.photos/seed/20/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user18",
    "maxSignups": 50,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user14",
      "auth0|user3",
      "auth0|user5",
      "auth0|user6"
    ]
  },
  {
    "id": "ac87a77f-27fe-4610-97e7-2c17881b8554",
    "title": "Kviz znanja",
    "description": "Opis dogodka Kviz znanja",
    "dateTime": "2025-07-25T12:51:45.736152",
    "location": "Novo mesto",
    "imageUrl": "https://picsum.photos/seed/21/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user1",
    "maxSignups": 50,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user9",
      "auth0|user18",
      "auth0|user13"
    ]
  },
  {
    "id": "7ed3388e-d25a-46f0-9956-a987c37a0d93",
    "title": "Predavanje o AI",
    "description": "Opis dogodka Predavanje o AI",
    "dateTime": "2025-06-07T12:51:45.736187",
    "location": "Velenje",
    "imageUrl": "https://picsum.photos/seed/22/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user15",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "e5bee760-2c62-4856-b69b-2c86b132fdb6",
    "title": "Naravoslovni pohod",
    "description": "Opis dogodka Naravoslovni pohod",
    "dateTime": "2025-06-15T12:51:45.736233",
    "location": "Ptuj",
    "imageUrl": "https://picsum.photos/seed/23/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user7",
    "maxSignups": 20,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "32b564b2-7d3e-4b6c-919b-7fe7e3369c35",
    "title": "Gledali\u0161ka predstava",
    "description": "Opis dogodka Gledali\u0161ka predstava",
    "dateTime": "2025-06-27T12:51:45.736259",
    "location": "Maribor",
    "imageUrl": "https://picsum.photos/seed/24/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user1",
    "maxSignups": null,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "8a0a53ae-764b-47d2-b509-2abfac041e01",
    "title": "Letni piknik",
    "description": "Opis dogodka Letni piknik",
    "dateTime": "2025-06-04T12:51:45.736272",
    "location": "Novo mesto",
    "imageUrl": "https://picsum.photos/seed/25/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user20",
    "maxSignups": null,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "9a19653c-0ee8-4ab1-a3b0-f26f73ded3de",
    "title": "Virtualna galerija",
    "description": "Opis dogodka Virtualna galerija",
    "dateTime": "2025-05-28T12:51:45.736285",
    "location": "Velenje",
    "imageUrl": "https://picsum.photos/seed/26/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user5",
    "maxSignups": null,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "33af9ff6-ff76-492c-8ba0-b4e8e7ece299",
    "title": "Zimska avantura",
    "description": "Opis dogodka Zimska avantura",
    "dateTime": "2025-06-20T12:51:45.736298",
    "location": "Velenje",
    "imageUrl": "https://picsum.photos/seed/27/400/300",
    "allowSignup": true,
    "reminderSent": false,
    "ownerId": "auth0|user12",
    "maxSignups": null,
    "visibility": "public",
    "visibleTo": []
  },
  {
    "id": "5285eb7f-8d0e-4ef2-91d8-bccb09e85920",
    "title": "Eko dan",
    "description": "Opis dogodka Eko dan",
    "dateTime": "2025-05-31T12:51:45.736310",
    "location": "Koper",
    "imageUrl": "https://picsum.photos/seed/28/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user6",
    "maxSignups": 50,
    "visibility": "private",
    "visibleTo": []
  },
  {
    "id": "ae23f8f3-a360-427b-a6fb-27fb5a5ca224",
    "title": "No\u010d znanosti",
    "description": "Opis dogodka No\u010d znanosti",
    "dateTime": "2025-06-03T12:51:45.736417",
    "location": "Ljubljana",
    "imageUrl": "https://picsum.photos/seed/29/400/300",
    "allowSignup": false,
    "reminderSent": false,
    "ownerId": "auth0|user14",
    "maxSignups": null,
    "visibility": "selected",
    "visibleTo": [
      "auth0|user1",
      "auth0|user2",
      "auth0|user5",
      "auth0|user16"
    ]
  }
];
    const visibilityLinks = [
  {
    "EventId": "2635461e-7985-4ceb-a42a-ead498faed1d",
    "UserId": "auth0|user4"
  },
  {
    "EventId": "2635461e-7985-4ceb-a42a-ead498faed1d",
    "UserId": "auth0|user1"
  },
  {
    "EventId": "fbaa5dfe-7255-4b99-a8f4-fddc24974eaf",
    "UserId": "auth0|user13"
  },
  {
    "EventId": "fbaa5dfe-7255-4b99-a8f4-fddc24974eaf",
    "UserId": "auth0|user8"
  },
  {
    "EventId": "17c80b80-c651-48b7-8cb2-fd0c70f227ff",
    "UserId": "auth0|user2"
  },
  {
    "EventId": "0c84d9d8-6070-4972-8049-7f8af2eb35d1",
    "UserId": "auth0|user2"
  },
  {
    "EventId": "0c84d9d8-6070-4972-8049-7f8af2eb35d1",
    "UserId": "auth0|user1"
  },
  {
    "EventId": "0c84d9d8-6070-4972-8049-7f8af2eb35d1",
    "UserId": "auth0|user19"
  },
  {
    "EventId": "0c84d9d8-6070-4972-8049-7f8af2eb35d1",
    "UserId": "auth0|user15"
  },
  {
    "EventId": "1d2e55a2-de48-4b94-956a-ee27334cc7ab",
    "UserId": "auth0|user18"
  },
  {
    "EventId": "1d2e55a2-de48-4b94-956a-ee27334cc7ab",
    "UserId": "auth0|user9"
  },
  {
    "EventId": "3a3a6603-2047-4eec-b813-95600d96545b",
    "UserId": "auth0|user1"
  },
  {
    "EventId": "bc62fd50-202b-44d5-a16a-54fb13f61999",
    "UserId": "auth0|user14"
  },
  {
    "EventId": "bc62fd50-202b-44d5-a16a-54fb13f61999",
    "UserId": "auth0|user3"
  },
  {
    "EventId": "bc62fd50-202b-44d5-a16a-54fb13f61999",
    "UserId": "auth0|user5"
  },
  {
    "EventId": "bc62fd50-202b-44d5-a16a-54fb13f61999",
    "UserId": "auth0|user6"
  },
  {
    "EventId": "ac87a77f-27fe-4610-97e7-2c17881b8554",
    "UserId": "auth0|user9"
  },
  {
    "EventId": "ac87a77f-27fe-4610-97e7-2c17881b8554",
    "UserId": "auth0|user18"
  },
  {
    "EventId": "ac87a77f-27fe-4610-97e7-2c17881b8554",
    "UserId": "auth0|user13"
  },
  {
    "EventId": "ae23f8f3-a360-427b-a6fb-27fb5a5ca224",
    "UserId": "auth0|user1"
  },
  {
    "EventId": "ae23f8f3-a360-427b-a6fb-27fb5a5ca224",
    "UserId": "auth0|user2"
  },
  {
    "EventId": "ae23f8f3-a360-427b-a6fb-27fb5a5ca224",
    "UserId": "auth0|user5"
  },
  {
    "EventId": "ae23f8f3-a360-427b-a6fb-27fb5a5ca224",
    "UserId": "auth0|user16"
  }
];

    for (const event of events) {
      const { visibleTo, ...eventData } = event;
      await Event.findOrCreate({ where: { id: event.id }, defaults: eventData });
    }

    for (const link of visibilityLinks) {
      await EventVisibility.findOrCreate({ where: link });
    }

    console.log('✅ Testni dogodki so bili uspešno dodani.');
    process.exit();
  } catch (error) {
    console.error('❌ Napaka pri dodajanju dogodkov:', error);
    process.exit(1);
  }
}

seedEvents();
