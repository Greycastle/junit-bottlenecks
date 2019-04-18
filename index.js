var parseString = require('xml2js').parseString;

async function read(stream) {
  let buffer = Buffer.alloc(0);
  for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer.toString('utf8');
}

async function run() {
  const xml = await read(process.stdin);

  parseString(xml, function (err, result) {

    const tests = result.testsuite.testcase.map(t => t['$']);;
    tests.forEach(t => t.time = parseFloat(t.time));
    tests.sort((t1, t2) => t2.time - t1.time);

    const classes = [];
    tests.forEach((test) => {
      const _class = classes.find(c => c.name === test.classname);
      if (_class) {
        _class.tests.push(test);
      } else {
        classes.push({
          name: test.classname,
          tests: [ test ]
        })
      };
    });

    classes.forEach((_class) => _class.time = _class.tests.reduce((total, test) => total + test.time, 0.0));

    
    classes.sort((c1, c2) => c2.time - c1.time);

    const slowest = {
      description: "Slowest three tests",
      tests: classes.slice(0, 3)
    };
    console.log(JSON.stringify(slowest, null, 2));
  });
}

run();