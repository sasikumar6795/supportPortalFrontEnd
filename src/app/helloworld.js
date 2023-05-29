const getBrand = function(brand) {
    return {
        name: 'sasiCompany',
        brand: `${brand}`
    }
}

console.log(getBrand('nike'));

console.log(JSON.stringify(getBrand('bata',null,0)));


//callbacks

const greetUser = (userName, callback) => {
    console.log(callback(userName));
}

const cb =  (userName) => {
    return "Hello " + userName
}

greetUser("james", cb);



const person = {
    name: "sasikumar",
    age: 27,
    dob: new Date(1995, 07, 06).toJSON(),
    address : {
        city: "chennai",
        pincode: 600028
    },
    toString: function() {
        return `${this.name} and his age is ${this.age}`
    }
}

console.log(person.toString())

const {
    name : firstName,
    age,
    address: {city}
 } = person;

 console.log(firstName, age, city);