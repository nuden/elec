const tinify = require("tinify");
tinify.key = "BdwcOR7wSRuuFjo8ojcWcHl4qvrZKeHR"
const program = require('commander');
/*
 示例：
 node tinyPNG -i E:\elec\tinyPNG\1.png -o E:\elec\tinyPNG\2.png
*/
program
  .version('0.0.1')
  .option('-i, --inPutAddress <type>', 'The image address of input')
  .option('-o, --outPutAddress <type>', 'The image address of output')
  .parse(process.argv);

main();

//入口函数
async function main() {
   
    if(program.inPutAddress && program.outPutAddress){
       
        let src = program.inPutAddress;
        let dest =program.outPutAddress;
        return tinyPng(src,dest);
    }

}

//通过tinyPng压缩图片
async function tinyPng(src, dest) {
    
    const source = tinify.fromFile(src);
    console.log("正在压缩图片，请稍后...")
    return source.toFile(dest).then(() => {
        console.log("压缩成功！");
    });
}
