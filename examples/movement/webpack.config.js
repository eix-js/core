const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader'
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: './index.html',
			filename: './index.html'
		})
	],
	resolve: {
		extensions: ['.js', '.ts']
	},
	entry: ['./index.ts']
}
