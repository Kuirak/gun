import * as Gun from "gun";

interface Schema {
  mark: Person;
  test: string;
}

interface Person { name: string;  address: Address; }
interface Address { zip: number, street: string;  city: string; owner: Person }

var gun = new Gun<Schema>();
var owner = gun.get('mark')
gun.get('mark')
  .get('address')
  .back<Person>()
  .get('address')
  .get('owner')
  .put(owner)

gun.put("test"); // should fail
gun.put(["test"]); // should fail

gun.put({ test: "blums" });

gun.get('mark').on(d => {
  
})

interface Ref { ref: string; }

type WithRef<D> = {
  // How to replace all object types with Ref?
  [K in keyof D]: D[K]
}

interface setRefs<D> { (data: D): WithRef<D>}

gun
  .get("mark")
  .put({
    name: "Mark",
    email: "mark@gunDB.io"
  })
  .get("name")
  .put("emilia")
  .put({ name: "Emilia" }); // should fail

gun.get("mark").get('name').on(function(data, key) {
  console.log("update:", data);
});
gun.get("mark").on(function(data, key) {
  console.log("update:", data);
});


gun.get('mark').get('address').map().on(function (data, key) {
    if(key === 'zip' ) {
      data // should be number
    }
})