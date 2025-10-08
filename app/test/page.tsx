import { Button } from "@/components/ui/button";

const TestPage = () => {
    return (
        <div>
            <h1>Test Page</h1>
            <Button variant="outline" size="lg">
                Click Me
            </Button>

            <div className="flex flex-wrap items-center gap-2 md:flex-row">
                <Button>Button</Button>
            </div>

            <div className="">

            </div>
        </div>
    )
}

export default TestPage;