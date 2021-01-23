function Potencia (Number,Index) {
	var n = Number
	var result 
	for(var i=0; i<Index; i++){
		if(i==0){
		result=n
		} else if (i!=0 && i!=Index){
		result = result*n
		}
	} 
	if(result=='Infinity'){
	result= '∞'
	}
	return result	
}


function Root (Number, Index){
	var result
	var n = Number
	if(Number<0){
		result = 'undefined'
		return result
	}
}



var e = Math.pow(100, 0.5)
console.log(e)