import React from 'react';
import './index.less';
import Summary from '../summary';

export default class List extends React.Component {
	static propTypes = {
		list: React.PropTypes.object
	}
	constructor() {
		super();
	}
	render() {
		var list = this.props.list;
		return (
			<div className="pt-list">
				<div className="list-content">
					{list.posts.map((post, index) => {
		        return (
							<div>
								<Summary post={post}></Summary>
							</div>);
		      })}
				</div>
			</div>
		);
	}
}
