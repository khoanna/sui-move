module hello_move::hello_move{
    use std::string;

    public struct Greeting has key {
        id: UID,
        text: string::String,
    }

    public fun create_greeting(text: string::String, ctx: &mut TxContext) {
        let new_greeting = Greeting {
            id: object::new(ctx),
            text,
        };
        transfer::share_object(new_greeting);
    }

    public fun update_greeting(greeting: &mut Greeting, new_text: string::String) {
        greeting.text = new_text;
    }

    public fun get_text(g: &Greeting): string::String {
        g.text
    }

}

