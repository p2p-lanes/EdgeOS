import { Card } from "@/components/ui/card"
import { FormInputWrapper } from "@/components/ui/form-input-wrapper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCityProvider } from "@/providers/cityProvider"
import { Star } from "lucide-react"

const CardVideo = ({ videoUrl, setVideoUrl }: { videoUrl: string, setVideoUrl: (url: string) => void }) => {
  const { getCity } = useCityProvider()
  const city = getCity()

  const isBhutan = city?.slug?.includes('bhutan')

  return (
    <Card className="px-6 mt-6 bg-slate-50 border-dashed border-2 border-slate-400">
      <div className="grid gap-4 sm:grid-cols-1 my-4">
        <FormInputWrapper>
          <div className="flex flex-col h-full my-1 gap-2">
            <p className="text-black flex items-center gap-2 font-medium text-sm">
              <Star className="w-4 h-4" /> Optional
            </p>
            <p className="text-sm text-black">
              Please record a 1-2 minute video sharing your quick response to the{' '}
              {!isBhutan ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="font-bold underline cursor-pointer">following questions</span>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white shadow-md border border-gray-200 max-w-sm">
                    <p className="text-sm text-gray-700 mt-1">
                      - What are your goals for {city?.name} and why do you want to join?
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      - What is something you could contribute? A workshop, a talk, an area of expertise. Get creative!
                    </p>
                  </PopoverContent>
                </Popover>
              ) : (
                'following questions'
              )}{' '}
              (you don't have to fill them in below if you add the video)
            </p>
            {isBhutan && (
              <div>
                <p className="text-sm text-gray-700 mt-1">
                  - What are your goals for {city?.name} and why do you want to join?
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  - What is something you could contribute? A workshop, a talk, an area of expertise. Get creative!
                </p>
              </div>
            )}
            <p className="text-sm text-gray-700 leading-4">
              You can upload your video to Dropbox, Google Drive, Youtube, or anywhere where you can make the link public and viewable
            </p>
            <Label htmlFor="video_url" className="text-sm text-black">Paste link here</Label>
            <Input
              id="video_url"
              value={videoUrl ?? ''}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="text-black border border-slate-400"
              placeholder="Video URL"
            />
          </div>
        </FormInputWrapper>
      </div>
    </Card>
  )
}

export default CardVideo
