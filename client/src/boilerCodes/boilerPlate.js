const cppBoiler = `#include<bits/stdc++.h>
using namespace std;

int main(){
	cout<<"Hello World!"<<endl;
	return 0;
}
`;
const pyBoiler = `print("Hello World!")`;
const jsBoiler = `console.log("Hello World");`;

module.exports = {
	cppBoiler,
	pyBoiler,
	jsBoiler,
};
