
var program = require('commander');
const axios = require('axios')

const POKE_URL = 'https://pokeapi.co/api/v2/type';
let  pokemon_id1;
let  pokemon_id2;
program
  .version('0.0.1')
  .command('Usage: pokemon  <id1>   <id2> - will give advantage of pokemon !')
  .option('-1, --pokemon_id1', 'First Pokemons Id')
  .option('-2, --pokemon_id2', 'Second Pokemons Id')
  .parse(process.argv);

  

 const getPokeMonInfo = async (id) =>{
    
    console.log("gonna fetch data from : "+`${POKE_URL}/${id}`);
      // grab the pokemon info from the api
      try {
        return await axios.get(`${POKE_URL}/${id}`) 
      } catch (error) {
        console.error (error)        
      }
  }


 getData = async () =>{

  // Create a list of urls to fetch from, since we want to make 2 calls to the API.
  // we build a list of axios calls and wrap them in a PromiseAll so that its 
  // done in parallel.

  let urls = [`${POKE_URL}/${pokemon_id1}` , `${POKE_URL}/${pokemon_id2}`]
  const  url_Promises = urls.map(url =>{
    return  axios(url);
  })
  return  await Promise.all(url_Promises);
}

evaluatePokeMons = async (att, def) => {
  // check if the attackers table to see if it  does double dmg against the defender
  // search for defender in  attackers table.
  let stronger = ["double_damage_to","","no_damage_from","half_damage_from" ]
  let weaker = ["half_damage_to", "double_damage_from","no_damage_to"]
  let return_id ="";

  try {
    found = false;                             // to flag if pokemon found
    let srchString = `/type/${def.id}/`;       // Check for /type/1/  not just /type/1
        
    for (item in att.data){
      for (let i = 0; i < att.data[item].length ; i++) {
        
        if (att.data[item][i].url.indexOf(srchString) !== -1  ) {
          console.log(" found with key: ", item, " url: ", att.data[item][i].url)
          found = true;
          if (stronger.indexOf(item) !== -1) {
            console.log("Id: ",att.id," is stronger than pokemon with id: ", def.id)
            return_id = att.id    // return attacker's Id
          }
          else  if (weaker.indexOf(item) !== -1) {  
            console.log("Pokemon with id:",att.id," is weaker than pokemon with id: ", def.id)
            return_id = def.id    // return id of defender , since its stronger
          }
        }
      }
    }
    if (found === false) {
      console.log("Possible that since no match was found, the pokemon's are evenly matched!")
      console.log(`didnt find ${srchString} in table for pokemon id ${att.id}`) ;
      return_id = att.id  ;   // return 1st pokemon id
    }
  } catch (e) {
      console.log(" caught an error",e)
  }
   return return_id  // pass out the id of the pokemon thats the winner
}

handleData = async (p1,p2) =>{
  var game_data = await getData();
 
     let player1 = {
      id: p1,
      data: game_data[0].data.damage_relations
    }
    let player2 = {
      id: p2,
      data: game_data[1].data.damage_relations
    }
// return the id of the pokemon with the advantage
let result = await evaluatePokeMons(player1, player2);  
console.log("Pokemon with advantage has id of :", result)

}

  data =  process.argv.slice(2);
  if (data.length !== 2 )
    console.log("Usage: pokemon <id1>  <id2> ");
    
  else {
    pokemon_id1 = parseInt(data[0]);
    pokemon_id2 = parseInt(data[1]);
    handleData(pokemon_id1,pokemon_id2);
  }
