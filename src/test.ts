import fs from "fs";

const main = async () => {
  const base64Image = fs.readFileSync("src/assets/image-one.jpg", "base64");
  var stringLength = base64Image.length - "data:image/png;base64,".length;

  var sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  var sizeInKb = sizeInBytes / 1000;
  const response = await fetch("https://gamertech-hardware-webhooks-o5ayzmg3ma-uc.a.run.app", {
    method: "POST",
    body: JSON.stringify({ image: `data:image/jpeg;base64,${base64Image}` }),
  });
  const json = await response.json();
  console.log(json);
};

main();
