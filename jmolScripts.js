/*
James Wonsever
Lawrence Berkeley Laboratory
Molecular Foundry
05/2012 -> Present

Custom Scripts and options for use with the Jmol applet.
Used with the moleculeEditor <div> in index.html.
*/

var appletID = "main";
var previewID = "preview";
var JMOL_SCRIPT_DIR = "http://portal.nersc.gov/project/als/ShirleyXAS/jmolScripts/"; //Where related jmol scritps are.
var MIN_CELL_SIZE = 4;//angstroms
var CELL_EXPAND_FACTOR = 2.5;//How far to expand the unit cell (multiplier)
<<<<<<< HEAD
var CrystalSymmetry = null; // flag set when crystal is loaded, use for crystal data // doesnt work properly yet...

=======
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906

//---------------------------------
//Editor Functions-----------------
//---------------------------------
function showOrbitals() {
    //how do I do this in a molecularly correct way??
    //text dropdown of the type of orbitals to show?
    //make this a toggle script, with "lcaoCartoon DELETE"
    var scr = "lcaoCartoon CREATE \"lp\" CREATE \"lpa\" CREATE \"lpb\"";
    jmolScriptWait(scr,appletID);
    //grab from a cube file???
}

function help() {
    //jmolScript("set ScriptCallback \"helpHelper\";", appletID)
    //var scr ="show unitcell;";
    //jmolScript(scr,appletID);
    //explain jmol
}
function helpHelper(app, msg) {
    //alert(msg);
    //explain jmol
}

//Button to minimize structure
function minimizeStructure() {
    jmolScriptWait("minimize",appletID);
}

//Currently turns on modelkit mode, may be expanded.
function toggleModelkitMode() {
     jmolScriptWait("set modelKitMode",appletID);
}

//upload files directly to the jmol main editor.
function uploadToEditor(form) {
    var file = form.uploadfile.files[0];
    var reader = new FileReader();    
    try {
	reader.onload = function(r) {
	    var scr = "LOAD DATA \"mod\"\n";
	    scr += String(reader.result);
	    scr +="\nEND \"mod\";show Data;";
	    //alert(scr);
	    jmolScriptWait(scr, appletID);
	    //drawMol();
	}
	reader.readAsText(file);	
    } catch(err) {
	alert("File error: bad file");
    }
}

function portCoordinates() {
    var submitForm = document.getElementById('inputs');
    var atoms = jmolGetPropertyAsArray("atomInfo", "all", "main"); // wont work on ubuntu chrome?
    //console.log(atoms);
    var coords = "";
    try {
	for (atom in atoms) {
	    coords += atoms[atom].sym + " ";
	    coords += atoms[atom].x + " ";
	    coords += atoms[atom].y + " ";
	    coords += atoms[atom].z + " ";
	    coords += "\n";
	    //console.log(atom);
	}
	submitForm.coordinates.value=coords;
    } catch(err) {
	submitForm.coordinates.value="ERROR, No Coordinates";
    }
    //fix so draws from .mol file?
    //drawMol();
}

//----------------------------------
//Preview Functions-----------------
//----------------------------------
function tryToGrabCrystalData() {
    var myform = document.getElementById('inputs');
    var jsVar = jmolGetPropertyAsJavaObject("auxiliaryinfo.models[0].infoUnitcell", "all", "preview");
    //console.log(jsVar);
    if(jsVar) {
<<<<<<< HEAD
	
	CrystalSymmetry = "" + jmolGetPropertyAsJavaObject("auxiliaryInfo.models[0].spaceGroup", "all", "preview");
=======
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
	myform.CrystalFlag.checked=true;
	//console.log(jsVar[5]);
	myform.CellA.value = "" + jsVar[0];
	myform.CellB.value = "" + jsVar[1];
	myform.CellC.value = "" + jsVar[2];
	myform.CellAlpha.value = "" + jsVar[3];
	myform.CellBeta.value = "" + jsVar[4];
	myform.CellGamma.value = "" + jsVar[5];
	return true;
    }
    else {
<<<<<<< HEAD
	CrystalSymmetry = null;
=======
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
	myform.CrystalFlag.checked=false;
	return false;
	//make cell size array as noncrystal
    }
}
function makeCellSize() {
    var flag = document.getElementById('inputs').CrystalFlag.checked;
    if (flag) {
	makeCrystalCellSize();
    } else {
	makeAbstractCellSize();
    }
<<<<<<< HEAD
    drawMolInPreview();
=======
    drawCell();
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
}
function makeCrystalCellSize() {
    //Does not modify alpha/beta/gamma (can it?)
    var myform = document.getElementById('inputs');
    var coordinates = sterilize(myform.coordinates.value).split("\n");
    var xyzmin = [10000, 10000, 10000];
    var xyzmax = [-10000, -10000, -10000];
    for (i in coordinates) {
	line = coordinates[i].split(" ");
	xyzmin[0] = Math.min(line[1], xyzmin[0]);
	xyzmin[1] = Math.min(line[2], xyzmin[1]);
	xyzmin[2] = Math.min(line[3], xyzmin[2]);
	xyzmax[0] = Math.max(line[1], xyzmax[0]);
	xyzmax[1] = Math.max(line[2], xyzmax[1]);
	xyzmax[2] = Math.max(line[3], xyzmax[2]);
    }
    var abc = [xyzmax[0]-xyzmin[0],
	       xyzmax[1]-xyzmin[1],
	       xyzmax[2]-xyzmin[2]];

    myform.CellA.value = "" + abc[0];
    myform.CellB.value = "" + abc[1];
    myform.CellC.value = "" + abc[2];
    //console.log(abc);
    return abc;
}
function makeAbstractCellSize() {
    var myform = document.getElementById('inputs');
    var coordinates = sterilize(myform.coordinates.value).split("\n");
    var xyzmin = [10000, 10000, 10000];
    var xyzmax = [-10000, -10000, -10000];
    for (i in coordinates) {
	line = coordinates[i].split(" ");
	xyzmin[0] = Math.min(line[1], xyzmin[0]);
	xyzmin[1] = Math.min(line[2], xyzmin[1]);
	xyzmin[2] = Math.min(line[3], xyzmin[2]);
	xyzmax[0] = Math.max(line[1], xyzmax[0]);
	xyzmax[1] = Math.max(line[2], xyzmax[1]);
	xyzmax[2] = Math.max(line[3], xyzmax[2]);
    }
    var abc = [Math.max(MIN_CELL_SIZE, xyzmax[0]-xyzmin[0])*CELL_EXPAND_FACTOR,
	       Math.max(MIN_CELL_SIZE, xyzmax[1]-xyzmin[1])*CELL_EXPAND_FACTOR,
	       Math.max(MIN_CELL_SIZE, xyzmax[2]-xyzmin[2])*CELL_EXPAND_FACTOR,
	       90, 90, 90];

    myform.CellA.value = "" + abc[0];
    myform.CellB.value = "" + abc[1];
    myform.CellC.value = "" + abc[2];
    myform.CellAlpha.value = "" + abc[3];
    myform.CellBeta.value = "" + abc[4];
    myform.CellGamma.value = "" + abc[5];
    //console.log(abc);
    return abc;
}
function readCoordsFromJmol() {
    var coords = "";
    var atoms = jmolGetPropertyAsArray("atomInfo", "all", "preview");
    for (atom in atoms) {
	coords += atoms[atom].sym + " ";
	coords += atoms[atom].x + " ";
	coords += atoms[atom].y + " ";
	coords += atoms[atom].z + " ";
	coords += "\n";
	//console.log(coords);
    }
    document.getElementById('inputs').coordinates.value=coords;
}
//Upload coordinates directly to coordinates text box, and preview box.
function uploadCoordinates(form) {
    var file = form.uploadfile.files[0];
    var name = form.uploadfile.value;
    name = name.split("//");
    name = name[name.length-1].replace(/\..*/, "");
    name = name.replace("C:\\fakepath\\", "");//Chrome Bug
    form.MOLNAME.value = name;
    var reader = new FileReader();
    try {
	reader.onload = function(r) {
	    var scr = "try{\nLOAD DATA \"mod\"\n";
	    scr += String(reader.result);
	    scr +="\nEND \"mod\";}catch(e){}";
	    jmolScriptWait(scr, "preview");
	    var gotCrystal = tryToGrabCrystalData();
	    readCoordsFromJmol();
	    if (!gotCrystal) {
		makeAbstractCellSize();
	    }
	    //Shouldn't have to do this vv for functioning selctions
	    //jmol resets these settings on load
	    drawMolInPreview();
	}
	reader.readAsText(file);	
    } catch(err) {
	form.coordinates.value="ERROR";
	return;
    }
}
<<<<<<< HEAD
function getUnitCell() {
    var myform = document.getElementById('inputs');
    var a = myform.CellA.value;
    var b = myform.CellB.value;
    var c = myform.CellC.value;
=======
function drawCell() {
    var myform = document.getElementById('inputs');
    var a = myform.CellA.value / 2.0;
    var b = myform.CellB.value / 2.0;
    var c = myform.CellC.value / 2.0;
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
    var alp = myform.CellAlpha.value;
    var bet = myform.CellBeta.value;
    var gam = myform.CellGamma.value;
    //a = a * Math.sin(alp*Math.PI/180);
    //b = b * Math.sin(bet*Math.PI/180);
    //c = c * Math.sin(gam*Math.PI/180);Not correct transform
<<<<<<< HEAD
    var vector = "{"+a+" "+b+" "+c+" "+alp+" "+bet+" "+gam+"}";
    var offset = "{"+(a/2.0)+" "+(b/2.0)+" "+(c/2.0)+"}";
    //console.log(vector);
    var scr = "";

    if (!CrystalSymmetry) {
	scr += "unitcell " + vector;
	scr += " offset " + offset;
    } else {
	scr += "spacegroup \""+ CrystalSymmetry + "\"";
	scr += " unitcell " + vector;
    }
    console.log(scr);
    return scr;
=======
    var vector = "{"+a+" "+b+" "+c+"}";
    //console.log(vector);
    var scr = "boundbox (all) "+vector+" ON;";
    //Fix this to incorporate angles.
    jmolScript(scr, previewID);
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
}
function drawMolInPreview() {
    var scr = "unbind 'RIGHT';";
    scr += "unbind 'LEFT' '_clickFrank'; "; 
    scr += "set defaultLattice {1,1,1}; ";
    var xyz = makeXYZfromCoords();
<<<<<<< HEAD
    scr += "xyz = \"" + xyz + "\";";
    //Open Try on successful load
    scr += "try{\nLOAD \"@xyz\" {1 1 0} ";
    scr += getUnitCell() + ";";
    scr += "selectionHalos on; ";
    scr += "set PickCallback \"jmolscript:javascript selectionCallback();\";";
    scr += "set picking select atom;";
    scr += "unitcell ON;";
=======
    //Open Try on successful load
    scr += "try{\nLOAD DATA \"mod\"\n" + xyz + "\nEND \"mod\";";
    scr += "selectionHalos on; ";
    scr += "set PickCallback \"jmolscript:javascript selectionCallback();\";";
    scr += "set picking select atom;";
    scr += "javascript drawCell();";
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
    scr += "javascript addSelections();";
    scr += "}catch(e){}";
    //console.log(scr);
    jmolScript(scr, previewID);
<<<<<<< HEAD
=======
    
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
}

//Redraw the molecule according to coordinates
function drawMol(suffix) {
    if (suffix == 'preview') {
	drawMolInPreview();
    } else {
	var xyz = makeXYZfromCoords();
	var scr = "try{\nLOAD DATA \"mod\"\n" + xyz + "\nEND \"mod\"}catch(e){}";
	//console.log(suffix + "\n" + scr);
	jmolScript(scr, suffix);
    }
}

function addSelections() {
    //Show changed selections on preview
    var XAS = document.getElementById('inputs').XASELEMENTS.value;
    XAS = XAS.split(" ");
    var scr = "select ";
    for (e in XAS) {
	element = XAS[e];
	if (element.match(/^[a-zA-Z]{1,2}\d+$/) != null) {
	    scr += element + " OR ";
	}
	if (element.match(/^[a-zA-Z]{1,2}$/) != null) {
	    scr += "_" + element + " OR ";
	}
    }
    scr += "none";
<<<<<<< HEAD
=======
    //console.log(scr);
>>>>>>> c39d83c70c81523ad2d41704110f2ef60ae31906
    jmolScript(scr, 'preview');
}
function selectionCallback() {
    var atoms = jmolGetPropertyAsArray("atomInfo", "selected", "preview");
    var XAS = "";
    for (a in atoms) {
	atom = atoms[a];
	XAS += atom.sym + atom.atomno + " ";
    }
    document.getElementById("inputs").XASELEMENTS.value = XAS;
    //edit so Knows to write "C" if all C's are selected
}