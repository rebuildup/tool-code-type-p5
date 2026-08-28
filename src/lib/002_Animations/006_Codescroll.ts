import { BaseAnimation, DrawingContext } from "./001_BaseAnimation";

export class Codescroll extends BaseAnimation {
	private rustCode: string;
	private fontSize: number = 14;
	private lineHeight: number = 18;
	private lineStartX: number = 40;
	private lineStartY: number = 40; // Changed from linestartY for consistency
	private scrollOffset: number = 0;
	private canvasHeight: number = 700; // Added canvas height variable as requested

	// Colors for syntax highlighting
	private defaultColor: number[] = [220, 220, 220]; // Default text color
	private commentColor: number[] = [100, 160, 100]; // Comments
	private keywordColor: number[] = [220, 140, 140]; // Keywords and types
	private stringColor: number[] = [220, 180, 120]; // String literals
	private macroColor: number[] = [180, 140, 220]; // Macros and attributes

	constructor(p5Instance: any, editorManager: any) {
		super(p5Instance, editorManager);
		// Sample Rust code
		this.rustCode = `use std::io::{self, Write};
use std::thread;
use std::time::Duration;

// Menu module: defines menu items and provides a sample menu.
mod menu {
    #[derive(Debug, Clone)]
    pub struct MenuItem {
        pub id: u32,
        pub name: String,
        pub price: f32,
    }
    
    impl MenuItem {
        pub fn new(id: u32, name: &str, price: f32) -> Self {
            MenuItem { id, name: name.to_string(), price }
        }
    }
    
    pub fn get_menu() -> Vec<MenuItem> {
        vec![
            MenuItem::new(1, "Burger", 5.99),
            MenuItem::new(2, "Fries", 2.99),
            MenuItem::new(3, "Salad", 4.99),
            MenuItem::new(4, "Pizza", 8.99),
            MenuItem::new(5, "Soda", 1.99),
            MenuItem::new(6, "Coffee", 2.49),
            MenuItem::new(7, "Ice Cream", 3.49),
        ]
    }
    
    pub fn display_menu(menu: &Vec<MenuItem>) {
        println!("====== Restaurant Menu ======");
        for item in menu {
            println!("{}: {} - ＄{:.2}", item.id, item.name, item.price);
        }
        println!("=============================");
    }
}

// Order module: handles customer orders.
mod order {
    use crate::menu::MenuItem;
    use std::io::{self, Write};
    
    #[derive(Debug)]
    pub struct Order {
        pub items: Vec<MenuItem>,
    }
    
    impl Order {
        pub fn new() -> Self { Order { items: Vec::new() } }
        pub fn add_item(&mut self, item: MenuItem) { self.items.push(item); }
        pub fn total(&self) -> f32 { self.items.iter().map(|item| item.price).sum() }
    }
    
    pub fn take_order(menu: &Vec<MenuItem>) -> Order {
        let mut order = Order::new();
        println!("Enter item ID to add to your order. Type 0 to finish.");
        loop {
            print!("Item ID: ");
            io::stdout().flush().unwrap();
            let mut input = String::new();
            io::stdin().read_line(&mut input).unwrap();
            if let Ok(choice) = input.trim().parse::<u32>() {
                if choice == 0 { break; }
                if let Some(item) = menu.iter().find(|item| item.id == choice) {
                    order.add_item(item.clone());
                    println!("Added {}.", item.name);
                } else {
                    println!("Invalid item ID.");
                }
            } else {
                println!("Please enter a valid number.");
            }
        }
        order
    }
}

// Payment module: simulates payment processing.
mod payment {
    use std::thread;
    use std::time::Duration;
    
    pub fn process_payment(total: f32) {
        println!("Processing payment...");
        thread::sleep(Duration::from_secs(2));
        println!("Payment of ＄{:.2} received.", total);
    }
}

// Loyalty module: manages a simple loyalty rewards program.
mod loyalty {
    #[derive(Debug)]
    pub struct LoyaltyAccount { pub points: u32 }
    
    impl LoyaltyAccount {
        pub fn new() -> Self { LoyaltyAccount { points: 0 } }
        pub fn add_points(&mut self, amount: u32) { self.points += amount; }
        pub fn redeem_points(&mut self, cost: u32) -> bool {
            if self.points >= cost { self.points -= cost; true } else { false }
        }
    }
    
    pub fn apply_loyalty(order_total: f32, account: &mut LoyaltyAccount) {
        let earned = (order_total as u32) * 10;
        account.add_points(earned);
        println!("Earned {} points. Total points: {}.", earned, account.points);
    }
}

// Receipt module: prints the order receipt.
mod receipt {
    use crate::order::Order;
    
    pub fn print_receipt(order: &Order) {
        println!("\n====== Receipt ======");
        for item in &order.items {
            println!("{} - ＄{:.2}", item.name, item.price);
        }
        println!("Total: ＄{:.2}", order.total());
        println!("=====================\n");
    }
}

// Simulate order preparation.
fn simulate_preparation(order: &order::Order) {
    println!("Preparing your order...");
    let wait_time = order.items.len() as u64 * 2;
    for i in 1..=wait_time {
        println!("Cooking... {} sec elapsed", i);
        thread::sleep(Duration::from_secs(1));
    }
    println!("Order is ready!");
}

// Simulate customer review submission.
fn simulate_review() {
    println!("Would you like to leave a review? (yes/no)");
    print!("Your answer: ");
    io::stdout().flush().unwrap();
    let mut answer = String::new();
    io::stdin().read_line(&mut answer).unwrap();
    if answer.trim().to_lowercase() == "yes" {
        println!("Thank you! Please write your review:");
        let mut feedback = String::new();
        io::stdin().read_line(&mut feedback).unwrap();
        println!("Review recorded: {}", feedback.trim());
    } else {
        println!("No review provided.");
    }
}

fn main() {
    println!("Welcome to the Rust Restaurant!");
    let menu = menu::get_menu();
    menu::display_menu(&menu);
    
    let mut loyalty_account = loyalty::LoyaltyAccount::new();
    let order = order::take_order(&menu);
    if order.items.is_empty() {
        println!("No items ordered. Exiting...");
        return;
    }
    
    receipt::print_receipt(&order);
    simulate_preparation(&order);
    payment::process_payment(order.total());
    loyalty::apply_loyalty(order.total(), &mut loyalty_account);
    simulate_review();
    println!("\nThank you for dining with us. See you again!");
}
`;
	}

	// Language support
	public currentLanguage: string = "rust";

	private syntaxRules: Record<
		string,
		{
			comments: string[];
			macros: string[];
			keywords: string[];
			strings: string[];
		}
	> = {
		rust: {
			comments: ["//"],
			macros: ["#[", "println!", "format!", "vec!"],
			keywords: [
				"fn ",
				"struct ",
				"enum ",
				"impl ",
				"let ",
				"use ",
				"match ",
				"pub ",
				"mod ",
				"crate ",
				"super ",
				"self ",
				"Self ",
				"where ",
				"move ",
				"async ",
				"await ",
			],
			strings: ['"'],
		},
		typescript: {
			comments: ["//", "/*"],
			macros: ["@", "console."],
			keywords: [
				"const ",
				"let ",
				"var ",
				"function ",
				"class ",
				"interface ",
				"type ",
				"import ",
				"export ",
				"from ",
				"return ",
				"if ",
				"else ",
				"switch ",
				"case ",
				"default ",
				"break ",
				"continue ",
				"try ",
				"catch ",
				"finally ",
				"async ",
				"await ",
				"new ",
				"this ",
				"extends ",
				"implements ",
			],
			strings: ['"', "'", "`"],
		},
		python: {
			comments: ["#"],
			macros: ["@"],
			keywords: [
				"def ",
				"class ",
				"import ",
				"from ",
				"return ",
				"if ",
				"elif ",
				"else ",
				"while ",
				"for ",
				"in ",
				"try ",
				"except ",
				"finally ",
				"with ",
				"as ",
				"pass ",
				"break ",
				"continue ",
				"lambda ",
				"yield ",
				"async ",
				"await ",
			],
			strings: ['"', "'"],
		},
		cpp: {
			comments: ["//", "/*"],
			macros: ["#include", "#define", "#ifdef", "#endif", "std::"],
			keywords: [
				"void ",
				"int ",
				"float ",
				"double ",
				"char ",
				"bool ",
				"class ",
				"struct ",
				"public:",
				"private:",
				"protected:",
				"virtual ",
				"override",
				"return ",
				"if ",
				"else ",
				"for ",
				"while ",
				"do ",
				"switch ",
				"case ",
				"break ",
				"continue ",
				"new ",
				"delete ",
				"using ",
				"namespace ",
				"template ",
				"typename ",
			],
			strings: ['"'],
		},
		html: {
			comments: ["<!--"],
			macros: ["<!DOCTYPE"],
			keywords: [
				"<html",
				"<head",
				"<body",
				"<div",
				"<span",
				"<p",
				"<a",
				"<img",
				"<script",
				"<style",
				"<link",
				"<meta",
				"<title",
				"<button",
				"<input",
				"<form",
				"<ul",
				"<li",
				"<table",
				"<tr",
				"<td",
				"<th",
				"</",
			],
			strings: ['"', "'"],
		},
		css: {
			comments: ["/*"],
			macros: ["@import", "@media", "@keyframes", "@font-face"],
			keywords: [
				"body",
				"div",
				"span",
				"p",
				".",
				"#",
				"color:",
				"background:",
				"margin:",
				"padding:",
				"width:",
				"height:",
				"display:",
				"position:",
				"top:",
				"left:",
				"right:",
				"bottom:",
				"font-",
				"border:",
				"flex",
				"grid",
			],
			strings: ['"', "'"],
		},
		java: {
			comments: ["//", "/*"],
			macros: ["@Override", "@Deprecated", "System.out"],
			keywords: [
				"public ",
				"private ",
				"protected ",
				"class ",
				"interface ",
				"extends ",
				"implements ",
				"void ",
				"int ",
				"boolean ",
				"String ",
				"return ",
				"if ",
				"else ",
				"for ",
				"while ",
				"try ",
				"catch ",
				"finally ",
				"new ",
				"this ",
				"super ",
				"package ",
				"import ",
				"static ",
				"final ",
			],
			strings: ['"'],
		},
		go: {
			comments: ["//", "/*"],
			macros: ["fmt."],
			keywords: [
				"func ",
				"package ",
				"import ",
				"type ",
				"struct ",
				"interface ",
				"return ",
				"if ",
				"else ",
				"for ",
				"range ",
				"switch ",
				"case ",
				"default ",
				"go ",
				"defer ",
				"chan ",
				"map ",
				"var ",
				"const ",
			],
			strings: ['"', "`"],
		},
	};

	// Simplified syntax coloring
	private getLineColor(line: string): number[] {
		const trimmed = line.trim();
		const rules =
			this.syntaxRules[this.currentLanguage] || this.syntaxRules["rust"];

		// Check comments
		if (rules.comments.some((c) => trimmed.startsWith(c))) {
			return this.commentColor;
		}

		// Check macros/decorators
		if (
			rules.macros.some((m) => trimmed.startsWith(m) || trimmed.includes(m))
		) {
			return this.macroColor;
		}

		// Check strings
		if (rules.strings.some((s) => line.includes(s))) {
			return this.stringColor;
		}

		// Check keywords
		if (rules.keywords.some((k) => trimmed.startsWith(k))) {
			return this.keywordColor;
		}

		return this.defaultColor;
	}

	public updateCode(newCode: string): void {
		this.rustCode = newCode;
	}

	public getCode(): string {
		return this.rustCode;
	}

	public setLanguage(language: string): void {
		if (this.syntaxRules[language]) {
			this.currentLanguage = language;
		}
	}

	public updateConfig(config: {
		fontSize?: number;
		lineHeight?: number;
		lineStartX?: number;
		lineStartY?: number;
		canvasHeight?: number;
		language?: string;
	}): void {
		if (config.fontSize !== undefined) this.fontSize = config.fontSize;
		if (config.lineHeight !== undefined) this.lineHeight = config.lineHeight;
		if (config.lineStartX !== undefined) this.lineStartX = config.lineStartX;
		if (config.lineStartY !== undefined) this.lineStartY = config.lineStartY;
		if (config.canvasHeight !== undefined)
			this.canvasHeight = config.canvasHeight;
		if (config.language !== undefined) this.setLanguage(config.language);
	}

	public getConfig() {
		return {
			fontSize: this.fontSize,
			lineHeight: this.lineHeight,
			lineStartX: this.lineStartX,
			lineStartY: this.lineStartY,
			canvasHeight: this.canvasHeight,
			language: this.currentLanguage,
		};
	}

	protected implementDrawing(
		context: DrawingContext,
		frameIndex: number,
	): void {
		// 背景は描画しない（透明にする）

		// フレームインデックスに基づいて表示する文字数を計算
		// 合計フレーム数を取得し、それに応じて文字表示のサイクルを決定
		const totalFrames = this.editorManager.getFrameCount();
		// 最後の20%のフレームで全テキストを表示し、それ以外は進行状況に応じて
		const displayProgress = Math.min(
			1.0,
			(frameIndex % totalFrames) / (totalFrames * 0.8),
		);
		const charsToDisplay = Math.floor(this.rustCode.length * displayProgress);

		// Get the text displayed so far
		const displayedText = this.rustCode.substring(0, charsToDisplay);
		const lines = displayedText.split("\n");

		// Calculate the bottom margin to maintain
		const bottomMargin = this.lineStartY;

		// Position of the last line (currently typing line)
		const lastLineIndex = lines.length - 1;
		const lastLineY = this.lineStartY + lastLineIndex * this.lineHeight;

		// Determine if we need to scroll to keep the last line in view
		if (lastLineY > this.canvasHeight - bottomMargin) {
			// Scroll enough to show the last line with padding at the bottom
			this.scrollOffset = lastLineY - (this.canvasHeight - bottomMargin);
		} else {
			// No need to scroll yet
			this.scrollOffset = 0;
		}

		// Set text properties
		context.textSize(this.fontSize);
		context.push(); // Save current state
		// Since textFont is not in the DrawingContext interface, use p5 directly
		this.p5.textFont("JetBrains Mono");

		// 背景は描画しない
		context.noStroke();

		// Draw visible lines with basic syntax highlighting
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const yPos = this.lineStartY + i * this.lineHeight - this.scrollOffset;

			// Only draw lines that are visible on the screen
			if (yPos >= 0 && yPos <= this.canvasHeight) {
				// 行番号は透明な素材のため表示しない
				context.textAlign(this.p5.LEFT);

				// Draw line with simple syntax coloring
				const color = this.getLineColor(line);
				context.fill(color[0], color[1], color[2]);
				context.text(line, this.lineStartX, yPos);
			}
		}

		// Draw cursor at the current typing position
		if (frameIndex % 30 < 15 && lines.length > 0) {
			// Blink every 30 frames
			const lastLine = lines[lines.length - 1];
			const lastLineY =
				this.lineStartY + lastLineIndex * this.lineHeight - this.scrollOffset;

			if (lastLineY >= 0 && lastLineY <= this.canvasHeight) {
				// Use p5 directly for textWidth since it's not in DrawingContext
				const cursorX = this.lineStartX + this.p5.textWidth(lastLine);

				context.fill(220, 220, 220);
				context.rect(cursorX, lastLineY - this.fontSize + 2, 2, this.fontSize);
			}
		}
		context.pop(); // Restore state
	}
}
