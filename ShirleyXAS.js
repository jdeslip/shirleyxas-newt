/*
James Wonsever
Lawrence Berkeley Laboratory
Molecular Foundry
05/2012 -> Present

Started by Ben Han

All Ajax and functionality scripts for the ShirleyXAS interface.
These scripts generally are used to send and retrieve data from NERSC computers.
 */

/* Constants */
var FILES_PER_PAGE = 20; //for reading results/jobs
var SHELL_CMD_DIR = "/project/projectdirs/als/shell_commands/"; //Where related bash scritps are.
var GLOBAL_SCRATCH_DIR = "/global/scratch/sd"; //postpend USER, global output Directory
var LOCAL_SCRATCH_DIR = "${SCRATCH}"; //Dont postpend USER, local output dir

//Login Function (NEWT)
function doAfterLogin() {
    checkAuth();
}
//Logout Function (NEWT)
function doAfterLogout() {
    myUsername = "invalid";
    checkAuth();
}
//Verifies Login, Shows Username
function checkAuth() {
    if (myUsername.indexOf("invalid") != -1) {
        $.newt_ajax({type: "GET",
		    url: "/login",    
		    success: function(res){
		    if (!res.auth) {
			tmpText = "Please Login";
			myUsername = "invalid";
		    } else {
			myUsername = res.username.toLowerCase();
			tmpText = "Welcome "+myUsername;
		    }
		    $("#auth").html(tmpText);
		    $("#auth").trigger('create');
		},
		    error: function(request,testStatus,errorThrown) {
		    console.log("CheckAuth error: " + testStatus + "  " + errorThrown);
		},
		    });
    }
}


//Lists all of the jobs currently running on Hopper and Carver, by ajax qstat.
function runningJobs() {
    //each job calls 3 qsubs...
    var machines=["hopper", "carver", "dirac"];
    var myText = "<table width=100\%><tr><th align=left>Running Calculations</th></tr></table><br><div align=left>";
    for (m in machines) {
	var machine = machines[m];
	myText+="<button onClick=\"runningOnMachine(document.getElementById('"+machine+"'))\">"+machine+"</button> ";
    }
    myText+="<br><br>";
    for (m in machines) {
	var machine = machines[m];
	myText+="<div id=\"" + machine + "\"></div> ";
    }
    myText+="<br></div>";
    console.log(myText);//Keep around. Shows what html actually shows up.
    $('#runningjobs').html(myText);
    $('#runningjobs').trigger('create');

}
//Run an Ajax command for the given machine, to get all running jobs.
function runningOnMachine(m) {
    var divid = m; //This is the actual div tag, not its ID.
    $(divid).html("</table><center><img src=\"ajax-loader-2.gif\"></center>");
    machineName = m.id;
    //check for dirac
    if (machineName != "dirac") {
	$.newt_ajax({type: "GET",
		    url: "/queue/"+machineName+"/?user="+myUsername,
		    success: function(res){
		    var resHTML=runningCalcs(res, machineName);
		    $(divid).html(resHTML);
		}
	    });
    } else {
	$(divid).html("<td align=left>Dirac jobs are not supported yet.</td></table>");
    }
}
//Ajax success function. Tables the jobs, kill feature, etc.
function runningCalcs(res, machine) {
    var myText = "";
    if (res != null && res.length > 0) {
		
	myText += "<table width=100\%><tr><th width=70\%>Job Name</th><th>Status</th><th width=120></th></tr></table>";
	myText += "<br><table width=100\% cellpadding=5>";
	
	for (var i = 0 ; i < res.length ; i++) {
	    if (res[i].user == myUsername) {
		//console.log(res[i]);
		    
		myText += "<tr class='listitem'>";
		    
		if (res[i].status == "R"){
		    myText += "<td width=70\%>" + res[i].name + "</td><td class=\"statusup\">"
			+ res[i].status + "</td><td align=center><button onClick=\"killJob(\'"
			+ res[i].jobid +"\')\" type=\"button\" >Cancel</button></td>";
		} else {
		    myText += "<td width=70\%>" + res[i].name + "</td><td class=\"statusnone\">"
			+ res[i].status + "</td><td align=center><button onClick=\"killJob(\'"
			+ res[i].jobid +"\')\" type=\"button\">Cancel</button></td>";
		}
		myText += "</tr>";
	    }
	}
	myText += "</table>";
	return myText;
	//$('#runningjobs').html(myText);
    } else {
	myText += "<table width=100\%><tr><td align=left>No Jobs on " + machine + ".</td></tr></table>";
	return myText;
       	//$('#runningjobs').html(myText);
    }
}
function killJob(job) {
    var jobid = job.replace(".sdb","");
    //console.log("Attempting kill job ");
    $.newt_ajax({type: "POST",
		url: "/command/hopper",
		//write a script that does this, along with deleting that folder in the working directory.
		data: {"executable": "/usr/common/nsg/bin/qdel "+jobid},
		success: function(res){
		console.log("Job deleted. It may take a minute for status to update.");
		runningJobsWrapper();
	    },
		error: function(request,testStatus,errorThrown) {
		console.log("Failed to kill job.\n"+testStatus+":\n"+errorThrown);
	    },
		});
}

function previousJobs() {
    //add timestamper
    $('#previousjobs').html("<table width=100\%><th align=left>Finished Calculations</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    $.newt_ajax({type: "GET",
		url: "/queue/completedjobs/"+myUsername,
		success: function(res){
		if (res != null && res.length > 0) {
		    var myText = "<table width=100\%><th align=left>Finished Calculations</th></table><br>";
		    myText += "<table width=100\%><tr><th width=70\%>Job Name</th><th>Hours</th><th width=120></th></tr></table>";
		    myText += "<table width=100\% cellpadding=5>"
			for (var i = 0 ; i < res.length ; i++) {
			    //console.log(res[i]);
			    myText += "<tr class='listitem'>";
			    myText += "<td width=70\%>" + res[i].jobname + "</td><td class=\"statusnone\">" + res[i].rawhours
				+ "</td><td><button onClick=\"viewJob(\'" + res[i].jobname + "\', \'" + res[i].hostname
				+ "\')\" type=\"button\">View Results</button></td>";
			    myText += "</tr>";
			}
		    myText += "</table:><br>";
		    $('#previousjobs').html(myText);
		    $('#previousjobs').trigger('create');
		} else {
		    $('#previousjobs').html("<table width=100\%><th align=left>Finished Calculations</th>"
					    + "</table><center><br>You don't have any finished calculations");
		}
	    },
		error: function(request,testStatus,errorThrown) {
		var myText = "Error:";
		myText += "<br><br>"+testStatus+"<br><br>"+errorThrown;
		$('#previousjobs').html(myText);
		$('#previousjobs').trigger('create');
	    },
		});

}

function individualJob(jobName, machine) {
    jobName = jobName.replace("-ANALYSE","").replace("-REF","").replace("-XAS","");
    $('#individualjob').html("<table width=100\%><th align=left>Results for "+jobName
			     + "</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    machine = machine.toLowerCase();
    var directory = "/file/" + machine + "/global/scratch/sd/" + myUsername + "/"+jobName.split("-")[0];
    $.newt_ajax({type: "GET",
		url: directory,
		success: function(res){
		if (res != null && res.length > 0) {
		    var myText = "<table width=100\%><th align=left>Results for " + jobName + "</th></table><br>";
		    myText += "<table width=100\%><tr><th width=70\%>Name</th><th>Size</th><th width=120></th></tr></table>";
		    myText += "<table width=100\% cellpadding=5>"
			for (var i = 0 ; i < res.length ; i++) {
			    var name = res[i].name.replace("-ANALYSE","").replace("-REF","").replace("-XAS","");
			    if (name == ".") continue;
			    myText += "<tr class='listitem'>";
			    myText += "<td width=70\%>" + res[i].name + "</td><td class=\"statusnone\">"
				+ res[i].size + "</td>";
			    if (res[i].perms.indexOf("d") != -1) {
				myText += "<td><button onClick=\"changeDir(\'" + directory + "/" + name
				    + "\', \'" + jobName + "\')\" type=\"button\">Change Directory</button></td>";
			    } else {
				myText += "<td><button onClick=\"getFile(\'" + directory + "/" + name
				    + "\', \'" + jobName + "\')\" type=\"button\">Get File</button></td>";
			    }
			    myText += "</tr>";
			}
		    myText += "</table:><br>";
		    $('#individualjob').html(myText);
		    $('#individualjob').trigger('create');
		} else {
		    $('#individualjob').html("<table width=100\%><th align=left>Finished Calculations</th></table>"
					     + "<center><br>Directory apparently empty. Whoops.");
		}
	    },
		error: function(request,testStatus,errorThrown) {
		var myText = "<center>Error:<br><br>"+testStatus+"<br><br>"+errorThrown+"</center>";
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
	    },
		});
}

function getFile(file, jobName) {
    $('#individualjob').html("<table width=100\%><th align=left>Results for "+jobName
			     + "</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    $.newt_ajax({type: "GET",
		url: file + "?view=read",
		success: function(res){
		var fileText = res.replace(/\n/g,"<br/>");
		directory = file + "/..";
		var myText = "<table width=100\%><th align=left>Results for " + jobName + "</th></table><br>"; 
		myText += "<table width=100\% cellpadding=5>";
		myText += "<tr class='listitem'><td width=70\%>..</td>";
		myText += "<td><button onClick=\"changeDir(\'" + directory + "\', \'" 
		    + jobName + "\')\" type=\"button\">Change Directory</button></td></tr>";
		myText += "<td align=left>" + fileText + "</td></table><br>";
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
	    },
		error: function(request,testStatus,errorThrown) {
		    
		var myText = "<center>Error:<br><br>"+testStatus+"<br><br>"+errorThrown+"</center>";
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
	    },
		});
}

function plotFile(file, jobName) {
    $('#individualjob').html("<table width=100\%><th align=left>Results for "+jobName
			     + "</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    $.newt_ajax({type: "GET",
		url: file + "?view=read",
		success: function(res){
		var fileText = res.split(/\r\n|\r|\n/);
		directory = file + "/..";
		var myText = "<table width=100\%><th align=left>Results for " + jobName + "</th></table><br>"; 
		myText += "<table width=100\% cellpadding=5>";
		myText += "<tr class='listitem'><td width=70\%>..</td>";
		myText += "<td><button onClick=\"changeDir(\'" + directory + "\', \'" 
		    + jobName + "\')\" type=\"button\">Change Directory</button></td></tr>";
		myText += "<td align=left><div id=\"chartdiv\" style=\"height:400px;width:420px; \"></div></td></table><br>";
		var numberOfSpect = fileText[1].split(" ").length - 1;
		var numberOfPoints = fileText.length - 2;
		var points = new Array(numberOfSpect);
		for (var i = 0; i < numberOfSpect; i++)
		    points[i] = new Array();
		for (var i = 1; i < numberOfPoints + 1; i++) {
		    var line = fileText[i].split(" ");
		    if (line.length < numberOfSpect) continue;
		    for (var j = 0; j < numberOfSpect; j++) {
			var offset = j * 0.01;
			points[j].push([parseFloat(line[0]), parseFloat(line[j + 1]) + offset]);
		    }
		}
		console.log(points);
		var options = {title: 'Average Absorption',
			       axes: {xaxis: {label: "Energy (eV)"},
				      yaxis: {show: false}},
			       seriesDefaults: {markerOptions: {size: 3}},      
		}
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
		$.jqplot('chartdiv', points, options);
	    },
		error: function(request,testStatus,errorThrown) {
		var myText = "<center>Error:<br><br>"+testStatus+"<br><br>"+errorThrown+"</center>";
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
	    },
		});
}

function changeDir(directory, jobName) {
    $('#individualjob').html("<table width=100\%><th align=left>Results for "+jobName
			     + "</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    $.newt_ajax({type: "GET",
		url: directory,
		success: function(res){
		if (res != null && res.length > 0) {
		    var myText = "<table width=100\%><th align=left>Results for " + jobName + "</th></table><br>";
		    myText += "<table width=100\%><tr><th width=70\%>Name</th><th>Size</th><th width=120></th></tr></table>";
		    myText += "<table width=100\% cellpadding=5>"
			for (var i = 0 ; i < res.length ; i++) {
			    var name = res[i].name;
			    myText += "<tr class='listitem'>";
			    myText += "<td width=70\%>" + name + "</td><td class=\"statusnone\">"
				+ res[i].size + "</td>";
			    if (res[i].perms.indexOf("d") != -1) {
				myText += "<td><button onClick=\"changeDir(\'" + directory + "/" + name
				    + "\', \'" + jobName + "\')\" type=\"button\">Change Directory</button></td>";
			    } else {
				//needs some work
				if (name.indexOf("Spectrum") != -1) {
				    myText += "<td><button onClick=\"plotFile(\'" + directory + "/" + name
					+ "\', \'" + jobName + "\')\" type=\"button\">Plot File</button></td>";
				} else {
				    myText += "<td><button onClick=\"getFile(\'" + directory + "/" + name
					+ "\', \'" + jobName + "\')\" type=\"button\">Get File</button></td>";
				}
			    }
			    myText += "</tr>";
			}
		    myText += "</table:><br>";
		    $('#individualjob').html(myText);
		    $('#individualjob').trigger('create');
		} else {
		    $('#individualjob').html("<table width=100\%><th align=left>Finished Calculations</th></table>"
					     + "<center><br>Directory apparently empty. Whoops.");
		}
	    },
		error: function(request,testStatus,errorThrown) {
		var myText = "<center>Error:<br><br>"+testStatus+"<br><br>"+errorThrown+"</center>";
		$('#individualjob').html(myText);
		$('#individualjob').trigger('create');
	    },
		});
}

function updateStatus(machine) {
    $.newt_ajax({type: "GET",
		url: "/status/"+machine,
		success: function(res) {
		var myText = machine + " is " + res.status + "<br>";
		$('#clusterStatus').html(myText);
		$('#clusterStatus').trigger('create');
	    },
		error: function(request, testStatus, errorThrown) {
		console.log("Failed to get cluster status.\n"+testStatus+":\n"+errorThrown);
	    },
		});
}


//Ensures that coordinates are properly written.
function sterilize(xyzcoords) {
    var lines = xyzcoords.split("\n");
    var out = "";
    for (l in lines) {
	var line = lines[l];
	//removes whitespace
	//console.log(line);
	line = line.replace(/^\s*/g, '').replace(/\s*$/g, '');
	line = line.replace(/[  ]{2,}|\t/g, ' ');
	//checks if the regex matches proper form
	//ex C 0 -.1 1.2e-4 valid number formats
	line = line.replace(/^((?!([a-zA-Z]{1,2}([ \t]-?\d+\.?\d*(e-?\d+)?){3})).)*$/, '');
	//console.log(line);
	if (line != "") {
	    if (l == 0) {
		out += line;
	    } else {
		out +="\n" + line;
	    }
	}
    }
    return out;
}

//Returns how many atoms are excited in this scenario, and thus how many nodes to use.
function getExcitedElementsTotal(coordsArray, xasElements) {
    // does not handle full regex
    var numNodes = 0;
    for (i in xasElements) {
	atoms = "" + xasElements[i];
	if (atoms.match(/^[a-zA-Z]{1,2}\d+$/) != null) {//C6 type
	    numNodes++;
	}
	else {//C Type
	    for (j in coordsArray) {
		if (coordsArray[j].split(" ")[0] == atoms)
		    numNodes++;
	    }
	}
    }
    return numNodes;
}

//Turns the given coordinates into a valid xyz file.
//Used primarily by DrawMol
function makeXYZfromCoords() {
    var myform=document.getElementById('inputs');
    var materialName = myform.material.value;
    var coords = sterilize(myform.coordinates.value);
    var numberOfAtoms = coords.split("\n").length;
    var xyz = numberOfAtoms + "\n" + materialName + "\n" + coords;
    return xyz;
}

//Confirm that all inputs are acceptable, then attempt to submit a new job.
function validateInputs(form) {
    form.Submit.disabled=true;
    var invalid = false;
    var message = "";
    if (form.material.value.length <= 0) {
	message += "Need material name to create output directory.\n";
	invalid = true; }
    //Set NNODES See if passes;
    var XAS = form.XASELEMENTS.value;
    var coordinates = sterilize(form.coordinates.value).split("\n");   
    form.NNODES.value = getExcitedElementsTotal(coordinates, XAS.split(" "));
    if (form.NNODES.value <= 0) {
	message += "Must excite at least one atom type in coordinates. \n";
	invalid = true; }
    //PPP Passes (AutoSet)
    //check crystal stats
    var a = form.CellA.value;
    var b = form.CellB.value;
    var c = form.CellC.value;
    if (a.match(/^\d*.?\d*?/) == null ||
	b.match(/^\d*.?\d*?/) == null || 
	c.match(/^\d*.?\d*?/) == null) {
	message += "Cell Size Dimensions are not valid. \n";
	invalid = true; }    
    var alp = form.CellAlpha.value;
    var bet = form.CellBeta.value;
    var gam = form.CellGamma.value;
    if (alp.match(/^\d*.?\d*?/) == null || alp > 180 ||
	bet.match(/^\d*.?\d*?/) == null || bet > 180 ||
	gam.match(/^\d*.?\d*?/) == null || gam > 180) {
	message += "Cell Size Angles are not valid. \n";
	invalid = true; }
    
    //Sterilize coordinates, if they have errors, drop them. (in newJobSubmission)
    if (invalid) {alert(message); form.Submit.disabled=false;}
    else 
	newJobSubmission(form);
 }

//Begin the process of submitting a new job.
function newJobSubmission(form) {
    form.Submit.disabled=true;
    $('#subStatus').show();
    $('#subStatus').html("<table width=100\%><th align=left>Working...</th></table><center><img src=\"ajax-loader-2.gif\"></center>");
    var command = "/project/projectdirs/als/shell_commands/makeFileDir.sh /global/scratch/sd/"+myUsername+" ";
    var materialName = form.material.value.replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s+/g," ");
   
    var machine = form.machine.value;
    var coordinates = form.coordinates.value;
    coordinates = sterilize(coordinates) + "\n";

    var d = new Date();
    var dateStr = d.toUTCString();//Wed, 06 Jun 2012 17:30:05 GMT
    materialName += dateStr.replace(/[a-zA-Z]*,/g,"").replace(/\s|:|(GMT)/g,"");//06Jun2012173005
    command += materialName;

    var xyz  = (coordinates.split("\n").length - 1) + "\n" + materialName + "\n" + coordinates;
    //Make the directory for this job, then, upon completion, upload coordinates.
    $.newt_ajax({type: "POST",
		url: "/command/" + machine,
		data: {"executable": command},
                success: function(res) {pushFile(form, machine, materialName, xyz);},
    	        error: function(request,testStatus,errorThrown) {
		 command = command.replace("makeFileDir", "rmFileDir");
		 $.newt_ajax({type: "POST",
			     url: "/command/" + machine,
			     data: {"executable": command},});
		 form.Submit.disabled=false;
	 	 $('#subStatus').html("<table width=100\%><th align=left>Failed!\n"+testStatus+":\n" + errorThrown+"</th></table>");
	    },});
}

//upload the coordinates file to the correct machine
function pushFile(form, machine, molName, xyzcoords) {
    $.newt_ajax({type: "PUT", 
		url: "/file/"+machine+"/global/scratch/sd/"+myUsername+"/"+molName+"/"+molName+".xyz",
		data: xyzcoords,
		success: function(res) {executeJob(form, molName);},
		error: function(request,testStatus,errorThrown) {
		var command = "/project/projectdirs/als/shell_commands/rmFileDir.sh /global/scratch/sd/"+myUsername+ " " + molName;
		$.newt_ajax({type: "POST",
			    url: "/command/" + machine,
			    data: {"executable": command},});
		form.Submit.disabled=false;
		$('#subStatus').html("<table width=100\%><th align=left>Failed!\n"+testStatus+":\n" + errorThrown + "</th></table>");},});
}

//Execute the submit script
function executeJob(form, materialName) {

    var dir = "/global/scratch/sd/"+myUsername;
    var inputs = "";
    var XAS = form.XASELEMENTS.value;
    var PPP = form.PPP.value;
    var nodes = form.NNODES.value;
    var machine = form.machine.value;

    //This is so hacked together, watch for escaped characters.
    //Pass inputs and pbs headers as files?
    var inputs="\"MOLNAME=\\\""+materialName+"\\\"\\n";
    inputs+="XASELEMENTS='"+XAS+"'\\n";
    inputs+="PPP="+PPP+"\\n";
    //is this crystal feature correct??
    inputs+="IBRAV=14\\n";
    inputs+="A="+form.CellA.value+"\\n";
    inputs+="B="+form.CellB.value+"\\n";
    inputs+="C="+form.CellC.value+"\\n";
    inputs+="cosBC="+form.CellAlpha.value+"\\n";
    inputs+="cosAC="+form.CellBeta.value+"\\n";
    inputs+="cosAB="+form.CellGamma.value+"\\n";
    inputs+="NJOB="+nodes+"\\n";
    inputs+='PW_POSTFIX=\\"-ntg $PPP\\"\\n\"';
    //console.log(inputs);

    var command = SHELL_CMD_DIR+"submit.sh ";
    command += dir + " ";
    command += materialName + " ";
    command += inputs + " ";
    command += nodes + " ";
    command += PPP + " ";
    command += machine + " ";
    //command += form.Queue.value + " ";
    //console.log(command);
    //Post job.
    $.newt_ajax({type: "POST",
		url: "/command/" + machine,
		data: {"executable": command},
		success: function(res){
		form.Submit.disabled=false;
		$('#subStatus').hide();
		console.log("Success!");
	    },
		error: function(request,testStatus,errorThrown) {
		 command = "/project/projectdirs/als/shell_commands/rmFileDir.sh /global/scratch/sd/"+myUsername+ " " + molName;
		 $.newt_ajax({type: "POST",
			     url: "/command/" + machine,
			     data: {"executable": command},});
		 form.Submit.disabled=false;
	  	 $('#subStatus').html("<table width=100\%><th align=left>Failed!\n"+testStatus+":\n" + errorThrown + "</th></table>");},
		});
}

//Div Wrapper functions.  For Organization. Checks Login Status.
function previousJobsWrapper() {
    if (myUsername.indexOf("invalid") != -1) {
        //
    } else {
        previousJobs();
    }
}

function runningJobsWrapper() {
    if (myUsername.indexOf("invalid") != -1) {
        //
    } else {
        runningJobs();
    }
}

function individualJobWrapper(myJobId, machine) {
    if (myUsername.indexOf("invalid") != -1) {
        //
    } else {
        individualJob(myJobId, machine);
    }
}
function editMoleculeWrapper() {
    if (myUsername.indexOf("invalid") != -1) {
        //
    } else {
        //
    }
}
//Div Functions.  Formats webpage.
function viewJob(myJobId, machine) {
    $('#runningjobs').hide();
    $('#previousjobs').hide();
    $('#shirleyinfo').hide();
    $('#submitjobs').hide();
    $('#individualjob').show();
    individualJobWrapper(myJobId, machine);
}

function switchToSubmitForm() {
    document.inputs.Submit.disabled=false;
    updateStatus(document.inputs.machine.value);
    $('#runningjobs').hide();
    $('#previousjobs').hide();
    $('#individualjob').hide();
    $('#shirleyinfo').hide();
    $('#subStatus').hide();
    $('#moleculeEditor').hide();
    $('#submitjobs').show();
}
function switchToPrevious() {
    $('#runningjobs').hide();
    $('#submitjobs').hide();
    $('#individualjob').hide();
    $('#shirleyinfo').hide();
    $('#moleculeEditor').hide();
    $('#previousjobs').show();
    previousJobsWrapper();
}
function switchToRunning() {
    $('#previousjobs').hide();
    $('#submitjobs').hide();
    $('#shirleyinfo').hide();
    $('#individualjob').hide();
    $('#moleculeEditor').hide();
    $('#runningjobs').show();
    runningJobsWrapper();
}
function switchToDrawMolecule() {
    $('#previousjobs').hide();
    $('#submitjobs').hide();
    $('#individualjob').hide();
    $('#shirleyinfo').hide();
    $('#runningjobs').hide();
    $('#moleculeEditor').show();
    editMoleculeWrapper();
}
function switchToInfo() {
    $('#previousjobs').hide();
    $('#submitjobs').hide();
    $('#individualjob').hide();
    $('#runningjobs').hide();
    $('#moleculeEditor').hide();
    $('#shirleyinfo').show();
}

