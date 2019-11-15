
async function foo(){
  return 'foo';
}

async function test() {
  await foo();
}

test();