async function whaleFunc(){
  return 'something';
}

async function main(){
  const whaleReturn = await whaleFunc();
  console.log('Hello', whaleReturn);
}

main();
