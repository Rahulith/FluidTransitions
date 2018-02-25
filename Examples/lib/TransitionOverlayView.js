import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';

class TransitionOverlayView extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        if(!this.props.pairs || !this.props.progress){
            console.log("TransitionOverlayView render empty");
			return <View 
				onLayout={this.onLayout.bind(this)} 
				style={styles.emptyOverlay} 
				pointerEvents={'none'}
			/>;
        }

		console.log("TransitionOverlayView render");
		const self = this;
		const sharedElements = this.props.pairs.map((pair, idx) => {

            const {fromItem, toItem} = pair;
			const transitionStyle = self.getTransitionStyle(self.props.progress, fromItem, toItem);

			// Buttons needs to be wrapped in a view to work properly.
			let element = React.Children.only(fromItem.reactElement.props.children);
			if(element.type.name === 'Button')
				element = (<View>{element}</View>);

			const AnimatedComp = Animated.createAnimatedComponent(element.type);
            const props = { ...element.props, 
                style: [element.props.style, transitionStyle],
                key: idx 
            };

			return React.createElement(AnimatedComp, props, element.props.children);
		});

		return (
			<Animated.View onLayout={this.onLayout.bind(this)} style={[styles.overlay]}>
				{sharedElements}
			</Animated.View>
		);
	}
	
	onLayout(event) {
		// const { x, y, width, height } = event.nativeEvent.layout;
		// console.log("TransitionOverlayView onLayout " + "x:" + x + " y:" + y + " w:" + width + " h:" + height);
	}
    componentWillReceiveProps(nextProps) {
        console.log("TransitionOverlayView componentWillReceiveProps");
    }

    getTransitionStyle(progress, fromItem, toItem) {
		const toVsFromScaleX = toItem.scaleRelativeTo(fromItem).x;
		const toVsFromScaleY = toItem.scaleRelativeTo(fromItem).y;

		const scaleX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleX],
		});

		const scaleY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [1, toVsFromScaleY],
		});

		const translateX = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [fromItem.metrics.x, toItem.metrics.x +
				fromItem.metrics.width/2 * (toVsFromScaleX-1)],
		});

		const translateY = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [fromItem.metrics.y, toItem.metrics.y +
				fromItem.metrics.height/2 * (toVsFromScaleY-1)],
		});

		return [styles.sharedElement, {
			width: fromItem.metrics.width,
			height: fromItem.metrics.height,
			transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
		}];
	}
}

const styles = StyleSheet.create({
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
        bottom: 0,
        backgroundColor: '#00FF0030',
    },
    emptyOverlay: {
        position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
        bottom: 0,
        backgroundColor: '#FF000030',
	},
	sharedElement: {
		position: 'absolute',
		borderColor: '#34CE34',
		borderWidth: 2,
		margin: 0,
		left: 0,
		top: 0,
	}
});

export default TransitionOverlayView;