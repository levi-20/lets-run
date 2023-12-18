
export const calculateRanking = (users: any, user: any, type: string): Number => {

	console.log('User', user);
	console.log('Users', users)
	switch (type) {
		case 'city':
			const cityRanking = users
				.filter((u: { city: any; }) => u.city === user.city)
				.sort((a: { total_distance_run: number; }, b: { total_distance_run: number; }) => b.total_distance_run - a.total_distance_run);
			return cityRanking.findIndex((u: { id: string; }) => u.id === user.id) + 1;
		case 'age':
			const ageRanking = users
				.filter((u: { age: any; }) => u.age === user.age)
				.sort((a: { total_distance_run: number; }, b: { total_distance_run: number; }) => b.total_distance_run - a.total_distance_run);
			return ageRanking.findIndex((u: { id: string; }) => u.id === user.id) + 1;
		case 'overall':
			const overallRanking = users.sort((a: { total_distance_run: number; }, b: { total_distance_run: number; }) => b.total_distance_run - a.total_distance_run);
			return overallRanking.findIndex((u: { id: string; }) => u.id === user.id) + 1;
		default:
			return -1;
	}
}