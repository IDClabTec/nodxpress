function Potencia (Number,Index) {
	console.log(Number+'  '+Index)
	var n = Number
	var result 
	for(var i=0; i<Index; i++){
		if(i==0){
		result=n
		console.log(result)
		} else if (i!=0 && i!=Index){
		result = result*n
		console.log('change result to '+result)
		}
	} 
	console.log(result)	
}


Potencia(5,)
console.log("init")