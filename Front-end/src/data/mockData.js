export const mockDataTeam = [
    {
      id: 1,
      name: "Jon Snow",
      email: "jonsnow@gmail.com",
      age: 35,
      phone: "(665)121-5454",
      access: "admin",
    },
    {
      id: 2,
      name: "Cersei Lannister",
      email: "cerseilannister@gmail.com",
      age: 42,
      phone: "(421)314-2288",
      access: "manager",
    },
    {
      id: 3,
      name: "Jaime Lannister",
      email: "jaimelannister@gmail.com",
      age: 45,
      phone: "(422)982-6739",
      access: "user",
    },
    {
      id: 4,
      name: "Anya Stark",
      email: "anyastark@gmail.com",
      age: 16,
      phone: "(921)425-6742",
      access: "admin",
    },
    {
      id: 5,
      name: "Daenerys Targaryen",
      email: "daenerystargaryen@gmail.com",
      age: 31,
      phone: "(421)445-1189",
      access: "user",
    },
    {
      id: 6,
      name: "Ever Melisandre",
      email: "evermelisandre@gmail.com",
      age: 150,
      phone: "(232)545-6483",
      access: "manager",
    },
    {
      id: 7,
      name: "Ferrara Clifford",
      email: "ferraraclifford@gmail.com",
      age: 44,
      phone: "(543)124-0123",
      access: "user",
    },
    {
      id: 8,
      name: "Rossini Frances",
      email: "rossinifrances@gmail.com",
      age: 36,
      phone: "(222)444-5555",
      access: "user",
    },
    {
      id: 9,
      name: "Harvey Roxie",
      email: "harveyroxie@gmail.com",
      age: 65,
      phone: "(444)555-6239",
      access: "admin",
    },
  ];

  
  export const mockDataCustomer = [
    {
      id: 1,
      name: "abdalla yasen",
      passportID:"314987447",
      email: "abdalla.yasen1@gmail.com",
      phone: "+972525945755",
    },
    {
      id: 2,
      name: "wagd nmerat",
      passportID:"211987447",
      email: "wagd.nmerat@gmail.com",
      phone: "+972525946958",
    },
    {
      id: 3,
      name: "Harvey Roxie",
      passportID:"626359874",
      email: "harveyroxie@gmail.com",
      phone: "+972525945755",
    },
    {
      id: 4,
      name: "mor david",
      passportID:"314987447",
      email: "mor@gmail.com",
      phone: "+972526987456",
    },
    {
      id: 5,
      name: "Ferrara Clifford",
      passportID:"353576558",
      email: "Ferrara@gmail.com",
      phone: "+972524976835",
    },
  
  ];


  export const mockDataEmployee = [
    {
      id: 1,
      name: "Jon Snow",
      email: "jonsnow@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "0912 Won Street, Alabama, SY 10001",
      city: "New York",
      startDate:"11/4/2024"
    },
    {
      id: 2,
      name: "Cersei Lannister",
      email: "cerseilannister@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "1234 Main Street, New York, NY 10001",
      city: "New York",
      startDate:"16/7/2023"
    },
    {
      id: 3,
      name: "Jaime Lannister",
      email: "jaimelannister@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "3333 Want Blvd, Estanza, NAY 42125",
      city: "New York",
      startDate:"1/1/2024"

    },
    {
      id: 4,
      name: "Anya Stark",
      email: "anyastark@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "1514 Main Street, New York, NY 22298",
      city: "New York",
            startDate:"5/3/2024"
    },
    {
      id: 5,
      name: "Daenerys Targaryen",
      email: "daenerystargaryen@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "11122 Welping Ave, Tenting, CD 21321",
      city: "Tenting",
      startDate:"11/4/2024"
    },
    {
      id: 6,
      name: "Ever Melisandre",
      email: "evermelisandre@gmail.com",
      zehotID: "(052)121-5454",
      phone: "(052)121-5454",
      address: "1234 Canvile Street, Esvazark, NY 10001",
      city: "Esvazark",
      startDate:"11/4/2024"
    },
  
  ];

  export const mockDataWorkStatus = [
    {
      id: 1,
      customername: "Jon Snow",
      email: "jonsnow@gmail.com",
      phone: "(052)121-5454",
      workname: "0912 Won Street, Alabama, SY 10001",
      city: "New York",
      orderDate:"11/4/2024",
      fieldStatus:"not assigned",
      officeStatus:"not assigned",
      officeEmployee:"not assigned",
      fieldEmployee:"not assigned",
      files: [],
    },
    {
      id: 2,
      customername: "waked",
      email: "waked@gmail.com",
      phone: "(052)121-43224",
      workname: " Alabama, SY 10001",
      city: "california",
      orderDate:"15/4/2024",
      fieldStatus:"not assigned",
      officeStatus:"not assigned",
      officeEmployee:"not assigned",
      fieldEmployee:"not assigned",
      files: [],
    },


    
  
  
  ];

 export const mockDataPosts = [
  {
    orderId: 1,
    posts: [
      {
        id: 1,
        employeeId: 1,
        content: "Initial post content",
        comments: [
          { id: 1, employeeId: 2, text: "First comment" },
          // More comments
        ],
      },
      // More posts
    ],
  }
];
