'use strict'

async function run(){
  try{ 
      process.stdout.write("gopify v1\n\n");

      let mediaFile = "";
      let args = process.argv.slice(2);    
      if (args.length > 0)
        mediaFile = args[0];
      else {
        process.stdout.write("mediafile argument missing!\n\n");
        process.stdout.write("syntax:\n");
        process.stdout.write("  gopify <mediafile>\n\n");
        return;
      } 
      let numeral = require('numeral');      
      let frames = await exec_ffprobe(mediaFile);
      let framesInGop = 0;

      process.stdout.write("output format:\n");
      process.stdout.write("  frame-pos pts-time gop gop-length\n\n");

      frames.frames.forEach(element => {        
        if (element.key_frame == 1){
            if (framesInGop > 0){ 
                process.stdout.write(' = ' + framesInGop.toString());
            } 
            process.stdout.write("\n");
            process.stdout.write(numeral(element.coded_picture_number).format('000000') + ' ' + numeral(element.pkt_pts_time).format('00000.000000') + ' ');
            framesInGop = 0;
        } 
        process.stdout.write(element.pict_type);
        ++framesInGop;  
      });
      process.stdout.write("\n\n");
  }
  catch (err){
    console.log(err, err.stack);
  }   
}



async function exec_ffprobe(mediaFile){
    let { spawn } = require('child_process');
    let proc = spawn('ffprobe',  ['-of', 'json', '-select_streams', 'v', '-show_entries', 'frame=pict_type,coded_picture_number,pkt_pts_time,key_frame', mediaFile ]);
    let output = "";

    for await (const data of proc.stdout) {
        output += data;
    };

    return JSON.parse(output);
} 



(async function() {
  await run();  
}());




