//. licenses.js
var fs = require( 'fs' );
var target_folder = '.'   //. 調査対象のプロジェクトソースフォルダを相対パスまたは絶対パスで指定
var licenses = {};

while( target_folder.endsWith( '/' ) ){
  target_folder = target_folder.substr( 0, target_folder.length - 1 );
}
var node_modules_folder = target_folder + '/node_modules/';
var folders = fs.readdirSync( node_modules_folder );
var cnt = 0;
folders.forEach( function( folder ){
  if( !folder.startsWith( '.' ) ){
    var license = null;
    var stats = fs.statSync( node_modules_folder + folder );
    if( stats.isDirectory() ){
      // LICENSE ファイルを探す
      var filename = node_modules_folder + folder + '/LICENSE';
      fs.readFile( filename, "utf-8", function( err, text ){
        if( text ){
          license = judgeLicense( text );
        }

        if( err || !license ){
          // README.md ファイルを探す
          filename = node_modules_folder + folder + '/README.md';
          fs.readFile( filename, "utf-8", function( err, text ){
            if( text ){
              license = judgeLicense( text );
            }

            if( err || !license ){
              // package.json ファイルを探す
              filename = node_modules_folder + folder + '/package.json';
              fs.readFile( filename, "utf-8", function( err, text ){
                if( text ){
                  license = judgeLicense( text );
                }

                if( err || !license ){
                  //. 本当に見つからなかった／わからなかった
                  foundLicense( folder, "NotFound" );
                  if( ++cnt == folders.length ){ showResult( licenses ); }
                }else{
                  foundLicense( folder, license );
                  if( ++cnt == folders.length ){ showResult( licenses ); }
                }
              });
            }else{
              foundLicense( folder, license );
              if( ++cnt == folders.length ){ showResult( licenses ); }
            }
          });
        }else{
          foundLicense( folder, license );
          if( ++cnt == folders.length ){ showResult( licenses ); }
        }
      });
    }
  }else{
    cnt ++;
  }
});

function foundLicense( folder, license ){
  if( licenses[license] ){
    licenses[license].push( folder );
  }else{
    licenses[license] = [ folder ];
  }
}

function judgeLicense( text ){
  var r = null;

  try{
    if( text.match( new RegExp( /MIT/ ) ) ){
      r = "MIT";
    }else if( text.match( new RegExp( /Apache/ ) ) ){
      r = "Apache";
    }else if( text.match( new RegExp( /ISC/ ) ) ){
      r = "ISC";
    }else if( text.match( new RegExp( /BSD/ ) ) ){
      r = "BSD";
    }else if( text.match( new RegExp( /Mozilla/ ) ) ){
      r = "Mozilla";
    }else if( text.match( new RegExp( /LGPL/ ) ) ){
      r = "LGPL";
    }else if( text.match( new RegExp( /GPL/ ) ) ){
      r = "GPL";
    }else if( text.match( new RegExp( /Artistic/ ) ) ){
      r = "Artistic";
    }else if( text.match( new RegExp( /Eclipse/ ) ) ){
      r = "Eclipse";
    }else{
      //r = "NotFound";
    }
  }catch( e ){
  }


  return r;
}

function showResult( licenses ){
  console.log( 'target_folder = ' + target_folder );
  var cnt = 0;
  for( var license in licenses ){
    cnt += licenses[license].length;
  }

  for( var license in licenses ){
    console.log( license + ': ' + ( Math.floor( licenses[license].length * 10000 / cnt ) / 100 ) + '%' );
    console.log( licenses[license] );
  }
}
