import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
const AccordionDemo = () => {
    return (
        <div className="flex items-center justify-center min-h-screen p-4 ">
            <div>


                <Accordion
                    type="single"
                    collapsible
                    className="p-4 w-1/2 bg-slate-50 rounded-lg shadow-md"
                    defaultValue="item-1"
                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Product Information</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                Our flagship product combines cutting-edge technology with sleek
                                design. Built with premium materials, it offers unparalleled
                                performance and reliability.
                            </p>
                            <p>
                                Key features include advanced processing capabilities, and an
                                intuitive user interface designed for both beginners and experts.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Shipping Details</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                We offer worldwide shipping through trusted courier partners.
                                Standard delivery takes 3-5 business days, while express shipping
                                ensures delivery within 1-2 business days.
                            </p>
                            <p>
                                All orders are carefully packaged and fully insured. Track your
                                shipment in real-time through our dedicated tracking portal.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Return Policy</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p>
                                We stand behind our products with a comprehensive 30-day return
                                policy. If you&apos;re not completely satisfied, simply return the
                                item in its original condition.
                            </p>
                            <p>
                                Our hassle-free return process includes free return shipping and
                                full refunds processed within 48 hours of receiving the returned
                                item.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            

            <div>
                Đây là ảnh 1
            </div>

            <div>
                <Button size="sm" disabled>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </Button>
            </div>
        </div>
    )
}


export default AccordionDemo